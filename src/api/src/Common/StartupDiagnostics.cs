using Microsoft.Extensions.Configuration;
using Npgsql;

namespace api_v2.Common;

/// <summary>
/// Produces a secret-safe summary of the API configuration used during startup.
/// </summary>
public sealed record StartupDiagnostics(
    string ListenerUrls,
    string DatabaseHost,
    string RedisHost,
    int RedisPort,
    string RabbitMqHost,
    string KeycloakHost,
    string StorageHost,
    IReadOnlyList<string> ValidationErrors)
{
    public static StartupDiagnostics Create(IConfiguration configuration)
    {
        var errors = new List<string>();
        var connectionString = configuration.GetConnectionString("PostgreSqlConnection");
        var databaseHost = GetDatabaseHost(connectionString, errors);

        var redisHost = configuration["Redis:Host"] ?? string.Empty;
        var redisPort = configuration.GetValue<int?>("Redis:Port") ?? 0;
        if (string.IsNullOrWhiteSpace(redisHost) || redisPort is < 1 or > 65535)
            errors.Add("Redis requires a non-empty Redis:Host and a Redis:Port between 1 and 65535.");

        var rabbitMqHost = configuration["RabbitMQ:HostName"] ?? string.Empty;
        if (string.IsNullOrWhiteSpace(rabbitMqHost))
            errors.Add("RabbitMQ requires RabbitMQ:HostName.");

        var keycloakHost = GetUriHost(configuration["Keycloak:MetadataAddress"], "Keycloak:MetadataAddress", errors);
        var storageHost = GetUriHost(configuration["Storage:S3:Endpoint"], "Storage:S3:Endpoint", errors);
        var listenerUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
            ?? configuration["urls"]
            ?? "(Kestrel default)";

        return new StartupDiagnostics(listenerUrls, databaseHost, redisHost, redisPort, rabbitMqHost,
            keycloakHost, storageHost, errors);
    }

    private static string GetDatabaseHost(string? connectionString, ICollection<string> errors)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            errors.Add("ConnectionStrings:PostgreSqlConnection is required.");
            return "(missing)";
        }

        try
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString);
            if (string.IsNullOrWhiteSpace(builder.Host))
            {
                errors.Add("ConnectionStrings:PostgreSqlConnection must specify Host.");
                return "(missing)";
            }

            return builder.Host;
        }
        catch (ArgumentException)
        {
            errors.Add("ConnectionStrings:PostgreSqlConnection is not a valid PostgreSQL connection string.");
            return "(invalid)";
        }
    }

    private static string GetUriHost(string? value, string settingName, ICollection<string> errors)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || string.IsNullOrWhiteSpace(uri.Host))
        {
            errors.Add($"{settingName} must be an absolute URL.");
            return "(invalid)";
        }

        return uri.IsDefaultPort ? uri.Host : $"{uri.Host}:{uri.Port}";
    }
}

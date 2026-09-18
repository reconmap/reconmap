using api_v2.Common;
using Microsoft.Extensions.Configuration;

namespace tests.Common;

public class StartupDiagnosticsTests
{
    [Fact]
    public void Create_ValidConfiguration_ReportsHostsWithoutSecrets()
    {
        var configuration = CreateConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:PostgreSqlConnection"] = "Host=postgres;Database=reconmap;Username=user;Password=secret",
            ["Redis:Host"] = "redis",
            ["Redis:Port"] = "6379",
            ["RabbitMQ:HostName"] = "rabbitmq",
            ["Keycloak:MetadataAddress"] = "http://keycloak:8080/realms/reconmap/.well-known/openid-configuration",
            ["Storage:S3:Endpoint"] = "http://rustfs:9000"
        });

        var diagnostics = StartupDiagnostics.Create(configuration);

        Assert.Empty(diagnostics.ValidationErrors);
        Assert.Equal("postgres", diagnostics.DatabaseHost);
        Assert.Equal("redis", diagnostics.RedisHost);
        Assert.Equal(6379, diagnostics.RedisPort);
        Assert.Equal("keycloak:8080", diagnostics.KeycloakHost);
        Assert.Equal("rustfs:9000", diagnostics.StorageHost);
        Assert.DoesNotContain("secret", diagnostics.ToString(), StringComparison.Ordinal);
    }

    [Fact]
    public void Create_InvalidConfiguration_ReportsActionableErrors()
    {
        var diagnostics = StartupDiagnostics.Create(CreateConfiguration(new Dictionary<string, string?>
        {
            ["ConnectionStrings:PostgreSqlConnection"] = "not a connection string",
            ["Redis:Port"] = "70000",
            ["Keycloak:MetadataAddress"] = "not-a-url",
            ["Storage:S3:Endpoint"] = "not-a-url"
        }));

        Assert.Contains(diagnostics.ValidationErrors, error => error.Contains("PostgreSqlConnection", StringComparison.Ordinal));
        Assert.Contains(diagnostics.ValidationErrors, error => error.Contains("Redis", StringComparison.Ordinal));
        Assert.Contains(diagnostics.ValidationErrors, error => error.Contains("RabbitMQ", StringComparison.Ordinal));
        Assert.Contains(diagnostics.ValidationErrors, error => error.Contains("Keycloak", StringComparison.Ordinal));
        Assert.Contains(diagnostics.ValidationErrors, error => error.Contains("Storage", StringComparison.Ordinal));
    }

    private static IConfiguration CreateConfiguration(IReadOnlyDictionary<string, string?> values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values).Build();
}

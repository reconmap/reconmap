using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace api_v2.Infrastructure.Authentication;

public class KeycloakOptions
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string KeycloakUrl { get; set; } = string.Empty;
    public string Realm { get; set; } = string.Empty;
}

public static class AuthenticationExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<KeycloakOptions>(
            config.GetSection("Keycloak"));

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.Audience = config["Keycloak:Audience"];
                options.MetadataAddress = config["Keycloak:MetadataAddress"];
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = config["Keycloak:ValidIssuer"],
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = false
                };
            });

        return services;
    }
}

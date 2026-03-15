namespace api_v2.Extensions;

public static class CorsExtensions
{
    public const string CustomCorsPolicy = "AllowCustomOrigins";

    public static IServiceCollection AddCorsPolicies(this IServiceCollection services, IConfiguration configuration)
    {
        var origins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        services.AddCors(p =>
            p.AddPolicy(CustomCorsPolicy, b =>
            {
                b.WithOrigins(origins)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            }));

        return services;
    }
}

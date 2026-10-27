namespace Reconmap.Api.Infrastructure.Security;

public static class OpaServiceCollectionExtensions
{
    public static IServiceCollection AddOpaAuthorization(this IServiceCollection services, IConfiguration configuration)
    {
        var serverUrl = configuration["Opa:ServerUrl"]?.TrimEnd('/') ?? "http://localhost:8181";
        var timeoutSeconds = configuration.GetValue("Opa:TimeoutSeconds", 5);

        services.AddHttpContextAccessor();
        services.AddHttpClient<OpaAuthorizationService>(client =>
            {
                client.BaseAddress = new Uri(serverUrl + "/");
                client.Timeout = TimeSpan.FromSeconds(timeoutSeconds * 4);
            })
            .AddStandardResilienceHandler(options =>
            {
                options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
                options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(timeoutSeconds * 3);
                options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(timeoutSeconds * 2);
            });

        return services;
    }
}

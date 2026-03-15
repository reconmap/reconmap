using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace api_v2.Infrastructure.Redis;

public static class RedisExtensions
{
    public static IServiceCollection AddRedisServices(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<RedisSettings>(config.GetSection("Redis"));

        services.AddSingleton(sp =>
            sp.GetRequiredService<IOptions<RedisSettings>>().Value);

        services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var settings = sp.GetRequiredService<RedisSettings>();

            var options = new ConfigurationOptions
            {
                EndPoints = { { settings.Host, settings.Port } },
                User = settings.User,
                Password = settings.Password,
                AbortOnConnectFail = false
            };

            return ConnectionMultiplexer.Connect(options);
        });

        services.AddHostedService<RedisQueueListener>();

        return services;
    }
}

using Reconmap.Api.Common.Messaging;
using Microsoft.Extensions.Options;

namespace Reconmap.Api.Infrastructure.Messaging;

public static class RabbitMQExtensions
{
    public static IServiceCollection AddRabbitMQServices(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<RabbitMQSettings>(config.GetSection("RabbitMQ"));
        services.AddSingleton<RabbitMQMessageQueue>();
        services.AddSingleton<IMessageQueue>(sp => sp.GetRequiredService<RabbitMQMessageQueue>());
        return services;
    }
}

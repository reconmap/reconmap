using Reconmap.Api.Common.Messaging;
using Reconmap.Api.Infrastructure.Sse;

namespace Reconmap.Api.Infrastructure.Messaging;

public class NotificationQueueListener(ILogger<NotificationQueueListener> logger,
    SseConnectionManager sseManager,
    IMessageQueue messageQueue) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Notification queue listener started, watching 'notifications' queue");

        await messageQueue.SubscribeAsync<object>("notifications", async message =>
        {
            logger.LogInformation("New notification from queue");
            // Broadcast to all SSE clients
            var json = System.Text.Json.JsonSerializer.Serialize(message);
            await sseManager.BroadcastAsync(json);
        }, stoppingToken);
    }
}

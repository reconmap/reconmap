using api_v2.Common.Messaging;
using api_v2.Infrastructure.WebSockets;

namespace api_v2.Infrastructure.Messaging;

public class NotificationQueueListener(ILogger<NotificationQueueListener> logger,
    WebSocketConnectionManager socketManager,
    IMessageQueue messageQueue) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Notification queue listener started, watching 'notifications' queue");

        await messageQueue.SubscribeAsync<object>("notifications", async message =>
        {
            logger.LogInformation("New notification from queue");
            // Broadcast to all WebSocket clients
            var json = System.Text.Json.JsonSerializer.Serialize(message);
            await socketManager.BroadcastAsync(json);
        }, stoppingToken);
    }
}

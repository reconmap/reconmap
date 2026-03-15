using api_v2.Infrastructure.WebSockets;
using StackExchange.Redis;

namespace api_v2.Infrastructure.Redis;

public class RedisQueueListener : BackgroundService
{
    private readonly string _listKey = "notifications:queue";
    private readonly ILogger<RedisQueueListener> _logger;
    private readonly IConnectionMultiplexer _redis;
    private readonly WebSocketConnectionManager _socketManager;

    public RedisQueueListener(ILogger<RedisQueueListener> logger,
        WebSocketConnectionManager socketManager,
        IConnectionMultiplexer redis)
    {
        _logger = logger;
        _socketManager = socketManager;
        _redis = redis;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var db = _redis.GetDatabase();
        _logger.LogInformation("Redis queue listener started, watching '{ListKey}'", _listKey);

        while (!stoppingToken.IsCancellationRequested)
            try
            {
                // BLPOP blocks until an element is available
                var result = await db.ListLeftPopAsync(_listKey);
                if (!result.IsNull)
                {
                    var message = result.ToString();
                    _logger.LogInformation("New item from Redis: {Message}", message);

                    // Broadcast to all WebSocket clients
                    await _socketManager.BroadcastAsync(message);
                }
                else
                {
                    await Task.Delay(100, stoppingToken);
                }
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogError(ex, "Redis connection lost; retrying in 5s");
                await Task.Delay(5000, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while reading from Redis");
                await Task.Delay(1000, stoppingToken);
            }

        _logger.LogInformation("Redis listener shutting down");
    }
}
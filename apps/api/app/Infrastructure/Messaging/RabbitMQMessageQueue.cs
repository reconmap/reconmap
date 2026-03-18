using System.Text;
using System.Text.Json;
using api_v2.Common.Messaging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace api_v2.Infrastructure.Messaging;

public class RabbitMQMessageQueue : IMessageQueue, IAsyncDisposable
{
    private readonly ILogger<RabbitMQMessageQueue> _logger;
    private readonly RabbitMQSettings _settings;
    private IConnection? _connection;
    private IChannel? _channel;
    private readonly SemaphoreSlim _connectionLock = new(1, 1);

    public RabbitMQMessageQueue(ILogger<RabbitMQMessageQueue> logger, IOptions<RabbitMQSettings> settings)
    {
        _logger = logger;
        _settings = settings.Value;
    }

    private async Task EnsureConnectionAsync()
    {
        if (_connection != null && _channel != null) return;

        await _connectionLock.WaitAsync();
        try
        {
            if (_connection != null && _channel != null) return;

            var factory = new ConnectionFactory
            {
                HostName = _settings.HostName,
                UserName = _settings.UserName,
                Password = _settings.Password
            };

            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();
        }
        finally
        {
            _connectionLock.Release();
        }
    }

    public async Task PublishAsync<T>(string queueName, T message)
    {
        await EnsureConnectionAsync();

        await _channel!.QueueDeclareAsync(queueName, durable: true, exclusive: false, autoDelete: false);

        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);

        var properties = new BasicProperties { Persistent = true };
        await _channel.BasicPublishAsync(exchange: string.Empty, routingKey: queueName, mandatory: false, basicProperties: properties, body: body);
    }

    public async Task SubscribeAsync<T>(string queueName, Func<T, Task> handler, CancellationToken cancellationToken)
    {
        await EnsureConnectionAsync();

        await _channel!.QueueDeclareAsync(queueName, durable: true, exclusive: false, autoDelete: false);
        await _channel.BasicQosAsync(0, 1, false);

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            var data = JsonSerializer.Deserialize<T>(message, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (data != null)
            {
                try
                {
                    await handler(data);
                    await _channel.BasicAckAsync(ea.DeliveryTag, false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message from queue {QueueName}", queueName);
                    // Nack and requeue
                    await _channel.BasicNackAsync(ea.DeliveryTag, false, true);
                }
            }
        };

        await _channel.BasicConsumeAsync(queue: queueName, autoAck: false, consumer: consumer);

        while (!cancellationToken.IsCancellationRequested)
        {
            await Task.Delay(1000, cancellationToken);
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel != null) await _channel.CloseAsync();
        if (_connection != null) await _connection.CloseAsync();
        _connectionLock.Dispose();
    }
}

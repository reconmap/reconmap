namespace api_v2.Common.Messaging;

public interface IMessageQueue
{
    Task PublishAsync<T>(string queueName, T message);
    Task SubscribeAsync<T>(string queueName, Func<T, Task> handler, CancellationToken cancellationToken);
}

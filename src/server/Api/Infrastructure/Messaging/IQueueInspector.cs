namespace Reconmap.Api.Infrastructure.Messaging;

public sealed record QueueStats(string Name, uint Messages, uint Consumers);

public interface IQueueInspector
{
    /// <summary>Returns ready-message and consumer counts. Queues that don't exist yet report zero.</summary>
    Task<IReadOnlyList<QueueStats>> GetQueueStatsAsync(
        IEnumerable<string> queueNames,
        CancellationToken cancellationToken = default);
}

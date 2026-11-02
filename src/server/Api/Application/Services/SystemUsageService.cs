using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Messaging;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Reconmap.Api.Application.Services;

public sealed record AttachmentUsage(int TotalCount, long TotalFileSize);

public sealed record RedisUsage(bool Available, long UsedMemoryBytes, long MaxMemoryBytes, long KeyCount);

public sealed record QueueUsage(string Name, uint Messages, uint Consumers);

public sealed record AiUsageTotals(
    long Calls,
    long FailedCalls,
    long InputTokens,
    long OutputTokens,
    decimal EstimatedCost,
    double AverageLatencyMs,
    long P95LatencyMs);

public sealed record AiUsageBreakdownRow(
    string Key,
    long Calls,
    long InputTokens,
    long OutputTokens,
    decimal EstimatedCost);

public sealed record AiUsageProjectRow(
    Guid? ProjectId,
    string? ProjectName,
    long Calls,
    long InputTokens,
    long OutputTokens,
    decimal EstimatedCost);

public sealed record AiUsageUserRow(
    int? UserId,
    long Calls,
    long InputTokens,
    long OutputTokens,
    decimal EstimatedCost);

public sealed record AiUsageDailyRow(
    DateTime Date,
    long Calls,
    long InputTokens,
    long OutputTokens,
    decimal EstimatedCost);

public sealed record AiUsageSummary(
    AiUsageTotals Totals,
    IReadOnlyList<AiUsageBreakdownRow> ByFeature,
    IReadOnlyList<AiUsageBreakdownRow> ByModel,
    IReadOnlyList<AiUsageProjectRow> ByProject,
    IReadOnlyList<AiUsageUserRow> ByUser,
    IReadOnlyList<AiUsageDailyRow> Daily);

public sealed record SystemUsage(
    DateTime From,
    DateTime To,
    AttachmentUsage Attachments,
    RedisUsage Redis,
    IReadOnlyList<QueueUsage> Queues,
    AiUsageSummary Ai);

public class SystemUsageService(
    AppDbContext db,
    IConnectionMultiplexer redis,
    IQueueInspector queueInspector,
    ILogger<SystemUsageService> logger)
{
    public const int TopRows = 10;

    /// <summary>Queues the API publishes to or consumes from through RabbitMQ.</summary>
    public static readonly string[] QueueNames =
        ["tasks", "notifications", "findings", "webhooks", "report-generation", "report-emails"];

    public async Task<SystemUsage> GetUsageAsync(DateTime from, DateTime to)
    {
        var totalCount = await db.Attachments.CountAsync();
        var totalFileSize = await db.Attachments
            .SumAsync(a => (long?)a.FileSize) ?? 0;

        var queues = (await queueInspector.GetQueueStatsAsync(QueueNames))
            .Select(q => new QueueUsage(q.Name, q.Messages, q.Consumers))
            .ToList();

        return new SystemUsage(
            from,
            to,
            new AttachmentUsage(totalCount, totalFileSize),
            await GetRedisUsageAsync(),
            queues,
            await GetAiUsageAsync(from, to));
    }

    private async Task<RedisUsage> GetRedisUsageAsync()
    {
        try
        {
            var endpoint = redis.GetEndPoints().FirstOrDefault();
            if (endpoint == null) return new RedisUsage(false, 0, 0, 0);

            var server = redis.GetServer(endpoint);
            var memory = (await server.InfoAsync("memory")).SelectMany(g => g)
                .ToDictionary(kv => kv.Key, kv => kv.Value);
            var keyCount = await server.DatabaseSizeAsync();

            return new RedisUsage(true, ParseLong(memory, "used_memory"), ParseLong(memory, "maxmemory"), keyCount);
        }
        catch (Exception exception)
        {
            // Usage stats are best effort: any Redis failure (permissions, connectivity) must not fail the page.
            logger.LogWarning(exception, "Could not read Redis usage.");
            return new RedisUsage(false, 0, 0, 0);
        }
    }

    private static long ParseLong(IReadOnlyDictionary<string, string> values, string key) =>
        values.TryGetValue(key, out var value) && long.TryParse(value, out var parsed) ? parsed : 0;

    private async Task<AiUsageSummary> GetAiUsageAsync(DateTime from, DateTime to)
    {
        var rows = db.AiUsages.AsNoTracking().Where(a => a.CreatedAt >= from && a.CreatedAt < to);

        var calls = await rows.CountAsync();
        if (calls == 0)
            return new AiUsageSummary(new AiUsageTotals(0, 0, 0, 0, 0, 0, 0), [], [], [], [], []);

        var totals = await rows
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Failed = g.Count(a => !a.Success),
                Input = g.Sum(a => a.InputTokens),
                Output = g.Sum(a => a.OutputTokens),
                Cost = g.Sum(a => a.EstimatedCost),
                AverageLatency = g.Average(a => (double)a.LatencyMs)
            })
            .SingleAsync();

        var latencies = await rows.Select(a => a.LatencyMs).OrderBy(l => l).ToListAsync();
        var p95 = latencies[Math.Min(latencies.Count - 1, (int)Math.Ceiling(latencies.Count * 0.95) - 1)];

        var byFeature = await Breakdown(rows, a => a.Feature);
        var byModel = await Breakdown(rows, a => a.Provider + " / " + a.Model);

        var byProject = await rows
            .GroupBy(a => a.ProjectId)
            .Select(g => new
            {
                ProjectId = g.Key,
                Calls = g.Count(),
                Input = g.Sum(a => a.InputTokens),
                Output = g.Sum(a => a.OutputTokens),
                Cost = g.Sum(a => a.EstimatedCost)
            })
            .ToListAsync();
        byProject = byProject
            .OrderByDescending(r => r.Cost).ThenByDescending(r => r.Input + r.Output)
            .Take(TopRows)
            .ToList();
        var projectIds = byProject.Where(r => r.ProjectId != null).Select(r => r.ProjectId!.Value).ToList();
        var projectNames = await db.Projects.AsNoTracking()
            .Where(p => projectIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Name);

        var byUser = await rows
            .GroupBy(a => a.UserId)
            .Select(g => new AiUsageUserRow(
                g.Key,
                g.Count(),
                g.Sum(a => a.InputTokens),
                g.Sum(a => a.OutputTokens),
                g.Sum(a => a.EstimatedCost)))
            .ToListAsync();
        byUser = byUser
            .OrderByDescending(r => r.EstimatedCost).ThenByDescending(r => r.InputTokens + r.OutputTokens)
            .Take(TopRows)
            .ToList();

        var daily = await rows
            .GroupBy(a => a.CreatedAt.Date)
            .Select(g => new AiUsageDailyRow(
                g.Key,
                g.Count(),
                g.Sum(a => a.InputTokens),
                g.Sum(a => a.OutputTokens),
                g.Sum(a => a.EstimatedCost)))
            .ToListAsync();
        daily = daily.OrderBy(r => r.Date).ToList();

        return new AiUsageSummary(
            new AiUsageTotals(calls, totals.Failed, totals.Input, totals.Output, totals.Cost, totals.AverageLatency, p95),
            byFeature,
            byModel,
            byProject.Select(r => new AiUsageProjectRow(
                r.ProjectId,
                r.ProjectId != null ? projectNames.GetValueOrDefault(r.ProjectId.Value) : null,
                r.Calls, r.Input, r.Output, r.Cost)).ToList(),
            byUser,
            daily);
    }

    private static async Task<List<AiUsageBreakdownRow>> Breakdown(
        IQueryable<AiUsage> rows,
        System.Linq.Expressions.Expression<Func<AiUsage, string>> key) =>
        (await rows
            .GroupBy(key)
            .Select(g => new AiUsageBreakdownRow(
                g.Key,
                g.Count(),
                g.Sum(a => a.InputTokens),
                g.Sum(a => a.OutputTokens),
                g.Sum(a => a.EstimatedCost)))
            .ToListAsync())
        .OrderByDescending(r => r.EstimatedCost).ThenByDescending(r => r.InputTokens + r.OutputTokens)
        .ToList();
}

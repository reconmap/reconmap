using System.Net;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Messaging;
using Reconmap.Api.Infrastructure.Persistence;
using StackExchange.Redis;

namespace Api.Tests.Application.Services;

public class SystemUsageServiceTests
{
    // Redis is unreachable in these tests: a proxy with no endpoints makes the service report it as unavailable.
    public class NoEndpointsRedis : DispatchProxy
    {
        protected override object? Invoke(MethodInfo? targetMethod, object?[]? args) =>
            targetMethod?.Name == nameof(IConnectionMultiplexer.GetEndPoints) ? Array.Empty<EndPoint>() : null;
    }

    private sealed class FakeInspector : IQueueInspector
    {
        public Task<IReadOnlyList<QueueStats>> GetQueueStatsAsync(
            IEnumerable<string> queueNames,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<QueueStats>>(queueNames.Select(n => new QueueStats(n, 3, 1)).ToList());
    }

    private static AppDbContext CreateDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static SystemUsageService CreateService(AppDbContext db) =>
        new(db, DispatchProxy.Create<IConnectionMultiplexer, NoEndpointsRedis>(), new FakeInspector(),
            NullLogger<SystemUsageService>.Instance);

    private static AiUsage Row(DateTime at, string feature, long input, long output, decimal cost,
        Guid? projectId = null, bool success = true, long latency = 100) => new()
    {
        CreatedAt = at,
        Provider = "P",
        Model = "m",
        Feature = feature,
        ProjectId = projectId,
        InputTokens = input,
        OutputTokens = output,
        EstimatedCost = cost,
        Success = success,
        LatencyMs = latency
    };

    [Fact]
    public async Task GetUsageAsync_WithNoAiCalls_ReturnsEmptySummary()
    {
        using var db = CreateDb();

        var usage = await CreateService(db).GetUsageAsync(DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);

        Assert.Equal(0, usage.Ai.Totals.Calls);
        Assert.Empty(usage.Ai.ByFeature);
        Assert.False(usage.Redis.Available);
        Assert.Equal(SystemUsageService.QueueNames.Length, usage.Queues.Count);
        Assert.All(usage.Queues, q => Assert.Equal(3u, q.Messages));
    }

    [Fact]
    public async Task GetUsageAsync_AggregatesAiUsageWithinRange()
    {
        using var db = CreateDb();
        var now = DateTime.UtcNow;
        db.Projects.Add(new Project { Id = TestIds.Of(1), Name = "Acme" });
        db.AiUsages.AddRange(
            Row(now.AddDays(-1), "triage", 100, 50, 0.5m, projectId: TestIds.Of(1), latency: 100),
            Row(now.AddDays(-1), "triage", 200, 100, 1.0m, projectId: TestIds.Of(1), latency: 300),
            Row(now.AddDays(-2), "remediation", 10, 10, 0.1m, success: false, latency: 200),
            Row(now.AddDays(-40), "triage", 9999, 9999, 99m)); // out of range
        await db.SaveChangesAsync();

        var usage = await CreateService(db).GetUsageAsync(now.AddDays(-7), now);

        var totals = usage.Ai.Totals;
        Assert.Equal(3, totals.Calls);
        Assert.Equal(1, totals.FailedCalls);
        Assert.Equal(310, totals.InputTokens);
        Assert.Equal(160, totals.OutputTokens);
        Assert.Equal(1.6m, totals.EstimatedCost);
        Assert.Equal(200, totals.AverageLatencyMs);
        Assert.Equal(300, totals.P95LatencyMs);

        Assert.Equal("triage", usage.Ai.ByFeature[0].Key);
        Assert.Equal(2, usage.Ai.ByFeature[0].Calls);
        var project = usage.Ai.ByProject[0];
        Assert.Equal(TestIds.Of(1), project.ProjectId);
        Assert.Equal("Acme", project.ProjectName);
        Assert.Equal(2, usage.Ai.Daily.Count);
    }
}

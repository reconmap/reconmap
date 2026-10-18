using System.Diagnostics;
using Microsoft.Extensions.AI;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Common;

public static class AiFeatures
{
    public const string Remediation = "remediation";
    public const string Triage = "triage";
    public const string AssetEnrichment = "asset-enrichment";
    public const string CommandParsing = "command-parsing";
    public const string ToolRecommendation = "tool-recommendation";
    public const string Other = "other";
}

/// <summary>Describes who asked for an LLM call and why, so usage can be attributed.</summary>
public sealed record AiUsageContext(string Feature, int? ProjectId = null, int? UserId = null);

/// <summary>What is being called: the configured provider/model and its prices per million tokens.</summary>
public sealed record AiUsageTarget(
    string Provider,
    string Model,
    decimal InputPricePerMTok,
    decimal OutputPricePerMTok);

public interface IAiUsageRecorder
{
    Task RecordAsync(AiUsage usage);
}

/// <summary>
/// Persists usage rows in their own scope so saving them never flushes unrelated pending changes of the caller.
/// Failures are logged and swallowed: usage tracking must never break an AI call.
/// </summary>
public sealed class AiUsageRecorder(IServiceScopeFactory scopeFactory, ILogger<AiUsageRecorder> logger)
    : IAiUsageRecorder
{
    public async Task RecordAsync(AiUsage usage)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.AiUsages.Add(usage);
            await db.SaveChangesAsync();
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to record AI usage for feature {Feature}", usage.Feature);
        }
    }
}

public sealed class UsageRecordingChatClient(
    IChatClient inner,
    IAiUsageRecorder recorder,
    AiUsageTarget target,
    AiUsageContext context) : DelegatingChatClient(inner)
{
    public override async Task<ChatResponse> GetResponseAsync(
        IEnumerable<ChatMessage> messages,
        ChatOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            var response = await base.GetResponseAsync(messages, options, cancellationToken);
            await RecordAsync(response.Usage, stopwatch.ElapsedMilliseconds, true);
            return response;
        }
        catch
        {
            await RecordAsync(null, stopwatch.ElapsedMilliseconds, false);
            throw;
        }
    }

    private Task RecordAsync(UsageDetails? usage, long latencyMs, bool success)
    {
        var inputTokens = usage?.InputTokenCount ?? 0;
        var outputTokens = usage?.OutputTokenCount ?? 0;

        return recorder.RecordAsync(new AiUsage
        {
            CreatedAt = DateTime.UtcNow,
            Provider = target.Provider,
            Model = target.Model,
            Feature = context.Feature,
            ProjectId = context.ProjectId,
            UserId = context.UserId,
            InputTokens = inputTokens,
            OutputTokens = outputTokens,
            LatencyMs = latencyMs,
            Success = success,
            EstimatedCost = (inputTokens * target.InputPricePerMTok + outputTokens * target.OutputPricePerMTok) /
                            1_000_000m
        });
    }
}

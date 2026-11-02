using System.Text.Json;
using Reconmap.Api.Application.CommandParsers;
using Reconmap.Api.Application.Commands;
using Reconmap.Api.Common;
using Reconmap.Api.Common.Messaging;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Application.Services;

public class CommandResultProcessor(
    ILogger<CommandResultProcessor> logger,
    IServiceScopeFactory _scopeFactory,
    IMessageQueue messageQueue) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await messageQueue.SubscribeAsync<CommandProcessorJob>("tasks", async job =>
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var aiService = scope.ServiceProvider.GetRequiredService<IAiService>();
            var assetUpsert = scope.ServiceProvider.GetRequiredService<IAssetUpsertService>();

            logger.LogInformation("Task queue popped");
            var commandUsage = CommandDiscovery.FindUsageById(job.CommandUsageId);
            if (commandUsage == null)
            {
                logger.LogError("Command usage with ID '{UsageId}' not found.", job.CommandUsageId);
                return;
            }
            var parser = CommandParserDiscovery.Create(scope.ServiceProvider, commandUsage.OutputParser);
            var result = parser.Parse(job);
            var numHosts = 0;
            if (result.assets.Count > 0)
            {
                try
                {
                    numHosts = await assetUpsert.UpsertTreeAsync(job.ProjectId, null, result.assets,
                        commandUsage.OutputParser, stoppingToken);
                }
                catch (Exception dbUpdateException)
                {
                    logger.LogError(dbUpdateException, "An error occurred while processing command results");
                    db.ChangeTracker.Clear();
                }
            }

            if (numHosts > 0)
            {
                // Jobs without a user (e.g. runner uploads) have nobody to notify
                if (job.UserId is int toUserId)
                {
                    var notification = new Notification
                    {
                        ToUserId = toUserId,
                        Title = "New assets found",
                        Content =
                            $"A total of '{numHosts}' new assets have been found by the '{commandUsage.OutputParser}' command",
                        Status = "unread"
                    };
                    db.Notifications.Add(notification);
                    await db.SaveChangesAsync(stoppingToken);
                }
            }

            var numFindingsAdded = 0;
            var numFindings = result.findings.Count;
            if (numFindings > 0)
            {
                foreach (var finding in result.findings)
                {
                    finding.ProjectId = job.ProjectId;
                    finding.Risk ??= "medium";
                    finding.Risk = "medium"; // @todo convert non-conventional risks

                    finding.CreatedById = job.UserId;
                    if (finding.Asset != null)
                    {
                        finding.AssetId = (await assetUpsert.UpsertAsync(job.ProjectId, null, finding.Asset,
                            commandUsage.OutputParser, stoppingToken)).Asset.Id;
                        finding.Asset = null;
                    }

                    if (await IsDuplicateFinding(db, finding))
                    {
                        logger.LogInformation("Skipping duplicate finding: {Summary}", finding.Summary);
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(finding.Remediation))
                    {
                        try
                        {
                            finding.Remediation = await aiService.GenerateRemediationAsync(
                                finding.Summary, job.ProjectId, job.UserId);
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "Failed to generate remediation for {Summary}", finding.Summary);
                        }
                    }

                    // Autonomously triage the finding as it is discovered
                    try
                    {
                        finding.AiTriage = await aiService.TriageFindingAsync(
                            finding.Summary,
                            finding.Description ?? string.Empty,
                            job.ProjectId,
                            job.UserId);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to triage finding {Summary}", finding.Summary);
                    }

                    db.Findings.Add(finding);
                    numFindingsAdded++;
                }

                try
                {
                    await db.SaveChangesAsync(stoppingToken);
                }
                catch (Exception dbUpdateException)
                {
                    logger.LogError(dbUpdateException, "An error occurred while processing command results");
                    db.ChangeTracker.Clear();
                }

                if (numFindingsAdded > 0)
                {
                    if (job.UserId is int findingsToUserId)
                    {
                        var notification = new Notification
                        {
                            ToUserId = findingsToUserId,
                            Title = "New findings found",
                            Content =
                                $"A total of '{numFindingsAdded}' new findings have been found by the '{commandUsage.OutputParser}' command",
                            Status = "unread"
                        };
                        db.Notifications.Add(notification);
                    }
                    await db.SaveChangesAsync(stoppingToken);
                }
            }

            if (numHosts > 0 || numFindingsAdded > 0)
                await messageQueue.PublishAsync("notifications", new { type = "message" });
        }, stoppingToken);
    }

    private async Task<bool> IsDuplicateFinding(AppDbContext db, Finding finding)
    {
        return await db.Findings.AnyAsync(v =>
            v.ProjectId == finding.ProjectId &&
            v.AssetId == finding.AssetId &&
            v.Summary == finding.Summary &&
            v.Status == "open");
    }
}

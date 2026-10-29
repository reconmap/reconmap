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

            var numVulnerabilitiesAdded = 0;
            var numVulnerabilities = result.vulnerabilities.Count;
            if (numVulnerabilities > 0)
            {
                foreach (var vulnerability in result.vulnerabilities)
                {
                    vulnerability.ProjectId = job.ProjectId;
                    vulnerability.Risk ??= "medium";
                    vulnerability.Risk = "medium"; // @todo convert non-conventional risks

                    vulnerability.CreatedById = job.UserId;
                    if (vulnerability.Asset != null)
                    {
                        vulnerability.AssetId = (await assetUpsert.UpsertAsync(job.ProjectId, null, vulnerability.Asset,
                            commandUsage.OutputParser, stoppingToken)).Asset.Id;
                        vulnerability.Asset = null;
                    }

                    if (await IsDuplicateVulnerability(db, vulnerability))
                    {
                        logger.LogInformation("Skipping duplicate vulnerability: {Summary}", vulnerability.Summary);
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(vulnerability.Remediation))
                    {
                        try
                        {
                            vulnerability.Remediation = await aiService.GenerateRemediationAsync(
                                vulnerability.Summary, job.ProjectId, job.UserId);
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "Failed to generate remediation for {Summary}", vulnerability.Summary);
                        }
                    }

                    // Autonomously triage the vulnerability as it is discovered
                    try
                    {
                        vulnerability.AiTriage = await aiService.TriageVulnerabilityAsync(
                            vulnerability.Summary,
                            vulnerability.Description ?? string.Empty,
                            job.ProjectId,
                            job.UserId);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to triage vulnerability {Summary}", vulnerability.Summary);
                    }

                    db.Vulnerabilities.Add(vulnerability);
                    numVulnerabilitiesAdded++;
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

                if (numVulnerabilitiesAdded > 0)
                {
                    if (job.UserId is int vulnerabilitiesToUserId)
                    {
                        var notification = new Notification
                        {
                            ToUserId = vulnerabilitiesToUserId,
                            Title = "New vulnerabilities found",
                            Content =
                                $"A total of '{numVulnerabilitiesAdded}' new vulnerabilities have been found by the '{commandUsage.OutputParser}' command",
                            Status = "unread"
                        };
                        db.Notifications.Add(notification);
                    }
                    await db.SaveChangesAsync(stoppingToken);
                }
            }

            if (numHosts > 0 || numVulnerabilitiesAdded > 0)
                await messageQueue.PublishAsync("notifications", new { type = "message" });
        }, stoppingToken);
    }

    private async Task<bool> IsDuplicateVulnerability(AppDbContext db, Vulnerability vulnerability)
    {
        return await db.Vulnerabilities.AnyAsync(v =>
            v.ProjectId == vulnerability.ProjectId &&
            v.AssetId == vulnerability.AssetId &&
            v.Summary == vulnerability.Summary &&
            v.Status == "open");
    }
}

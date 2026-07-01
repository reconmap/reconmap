using System.Text.Json;
using api_v2.Application.CommandParsers;
using api_v2.Application.Commands;
using api_v2.Common;
using api_v2.Common.Messaging;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

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

            logger.LogInformation("Task queue popped");
            var commandUsage = CommandDiscovery.FindUsageById(job.CommandUsageId);
            if (commandUsage == null)
            {
                logger.LogError("Command usage with ID '{UsageId}' not found.", job.CommandUsageId);
                return;
            }
            var parser = CommandParserDiscovery.Create(scope.ServiceProvider, commandUsage.OutputParser);
            var result = parser.Parse(job);
            var numHosts = result.assets.Count;
            if (numHosts > 0)
            {
                foreach (var asset in result.assets)
                {
                    asset.ProjectId = job.ProjectId;
                    db.Assets.Add(asset);
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

                var notification = new Notification
                {
                    ToUserId = job.UserId,
                    Title = "New assets found",
                    Content =
                        $"A total of '{numHosts}' new assets have been found by the '{commandUsage.OutputParser}' command",
                    Status = "unread"
                };
                db.Notifications.Add(notification);
                await db.SaveChangesAsync(stoppingToken);
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

                    vulnerability.CreatedByUid = job.UserId;
                    if (vulnerability.Asset != null)
                    {
                        vulnerability.AssetId = await GetAssetId(db, vulnerability.Asset);
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
                            vulnerability.Remediation = await aiService.GenerateRemediationAsync(vulnerability.Summary);
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "Failed to generate remediation for {Summary}", vulnerability.Summary);
                        }
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
                    var notification = new Notification
                    {
                        ToUserId = job.UserId,
                        Title = "New vulnerabilities found",
                        Content =
                            $"A total of '{numVulnerabilitiesAdded}' new vulnerabilities have been found by the '{commandUsage.OutputParser}' command",
                        Status = "unread"
                    };
                    db.Notifications.Add(notification);
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

    private async Task<uint> GetAssetId(AppDbContext db, Asset asset)
    {
        var dbAsset = await db.Assets.AsNoTracking().Where(a => a.Type == asset.Type && a.Name == asset.Name)
            .SingleOrDefaultAsync();
        if (dbAsset != null) return dbAsset.Id;

        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        return asset.Id;
    }
}

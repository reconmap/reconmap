using System.Text.Json;
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

            logger.LogInformation("Task queue popped");
            var commandUsage = await db.CommandUsages.FindAsync(job.CommandUsageId);
            var processor = ProcessorIntegrationDiscovery.Create(scope.ServiceProvider, commandUsage.OutputParser);
            var result = processor.Process(job);
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

            var numFindings = result.findings.Count;
            if (numFindings > 0)
            {
                foreach (var finding in result.findings)
                {
                    finding.ProjectId = job.ProjectId;
                    finding.Risk ??= "medium";
                    finding.Risk = "medium"; // @todo convert non-conventional risks

                    finding.CreatedByUid = job.UserId;
                    if (finding.Asset != null)
                    {
                        finding.TargetId = await GetAssetId(db, finding.Asset);
                        finding.Asset = null;
                    }

                    db.Vulnerabilities.Add(finding);
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
                    Title = "New findings found",
                    Content =
                        $"A total of '{numFindings}' new findings have been found by the '{commandUsage.OutputParser}' command",
                    Status = "unread"
                };
                db.Notifications.Add(notification);
                await db.SaveChangesAsync(stoppingToken);
            }

            if (numHosts > 0 || numFindings > 0)
                await messageQueue.PublishAsync("notifications", new { type = "message" });
        }, stoppingToken);
    }

    private async Task<uint> GetAssetId(AppDbContext db, Asset asset)
    {
        var dbAsset = await db.Assets.AsNoTracking().Where(a => a.Kind == asset.Kind && a.Name == asset.Name)
            .SingleOrDefaultAsync();
        if (dbAsset != null) return dbAsset.Id;

        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        return asset.Id;
    }
}

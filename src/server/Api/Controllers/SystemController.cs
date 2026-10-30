using Microsoft.Extensions.Options;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Common.Messaging;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace Reconmap.Api.Controllers;

// Your AppDbContext
public sealed class ExportableItem
{
    public required string Key { get; set; }
    public required string Description { get; set; }
    public Type? ClassType { get; set; }
}

public static class ExportablesRegistry
{
    public static readonly IReadOnlyList<ExportableItem> Items = new List<ExportableItem>
    {
        new() { Key = "audit_log", Description = "Audit log" }, //ClassType = typeof(AuditLogExporter) },
        new() { Key = "commands", Description = "Commands" }, //ClassType = typeof(CommandsExporter) },
        new() { Key = "documents", Description = "Documents" }, //ClassType = typeof(DocumentsExporter) },
        new() { Key = "projects", Description = "Projects" }, //ClassType = typeof(ProjectsExporter) },
        new()
        {
            Key = "project_templates", Description = "Project templates"
        }, //ClassType = typeof(ProjectTemplatesExporter) },
        new() { Key = "tasks", Description = "Tasks" }, //ClassType = typeof(TasksExporter) },
        new() { Key = "assets", Description = "Assets" }, //ClassType = typeof(AssetsExporter) },
        new() { Key = "organisations", Description = "Organisations" }, //ClassType = typeof(ClientsExporter) },
        new() { Key = "users", Description = "Users" }, //ClassType = typeof(UsersExporter) },
        new()
        {
            Key = "findings", Description = "Findings"
        }, //ClassType = typeof(FindingsExporter) },
        new()
        {
            Key = "finding_categories", Description = "Finding categories"
        }, //ClassType = typeof(FindingCategoriesExporter) },
        new()
        {
            Key = "finding_templates", Description = "Finding templates"
        } //ClassType = typeof(FindingTemplatesExporter) },
    };
}

[Route("api/[controller]")]
[ApiController]
public class SystemController(
    AppDbContext db,
    IConnectionMultiplexer redis,
    ILogger<SystemController> logger,
    SystemUsageService service,
    IMailSettingsService mailSettingsService,
    IAiSettingsService aiSettingsService,
    IAttachmentStorage attachmentStorage,
    HealthCheckService healthCheckService,
    McpHealthProbe mcpHealthProbe,
    IOptions<StorageSettings> storageSettings)
    : ControllerBase
{
    [HttpGet("upload-limits")]
    public IActionResult GetUploadLimits()
    {
        var uploads = storageSettings.Value.Uploads;
        return Ok(new
        {
            maxFileSizeBytes = uploads.EffectiveMaxFileSizeBytes,
            maxFilesPerRequest = uploads.EffectiveMaxFilesPerRequest,
            maxCommandOutputBytes = uploads.EffectiveMaxCommandOutputBytes,
            allowedExtensions = uploads.EffectiveAllowedExtensions().Order().ToArray()
        });
    }

    [HttpGet("custom-fields")]
    public async Task<IActionResult> GetAll([FromQuery] int? limit)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit ?? 100, maxLimit);

        var q = db.CustomFields.AsNoTracking()
            .OrderByDescending(a => a.CreatedAt);

        var page = await q.Take(take).ToListAsync();
        return Ok(page);
    }

    [HttpPost("custom-fields")]
    public async Task<IActionResult> Create([FromBody] CustomField entity)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        db.CustomFields.Add(entity);
        await db.SaveChangesAsync();

        return Created("/api/system/custom-fields", entity);
    }

    [HttpDelete("custom-fields/{id:int}")]
    public async Task<IActionResult> Create(int id)
    {
        var deleted = await db.CustomFields
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleted == 0) return NotFound();

        return NoContent();
    }

    [HttpGet("health")]
    public async Task<IActionResult> GetStatus()
    {
        var attachmentsWritable = CheckStorageWritableAsync();
        var database = MeasureAsync(CheckDatabaseAsync);
        var redisServer = MeasureAsync(CheckRedisAsync);
        var messageQueue = MeasureAsync(CheckMessageQueueAsync);
        var mcp = mcpHealthProbe.CheckAsync();

        await Task.WhenAll(attachmentsWritable, database, redisServer, messageQueue, mcp);

        var result = new
        {
            attachmentsDirectory = attachmentsWritable.Result,
            databaseServer = database.Result,
            keyValueServer = redisServer.Result,
            messageQueueServer = messageQueue.Result,
            mcpServer = mcp.Result
        };

        return Ok(result);
    }

    [HttpGet("exportables")]
    public IActionResult Get()
    {
        var result = ExportablesRegistry.Items
            .Select(x => new { x.Key, x.Description });

        return Ok(result);
    }

    private async Task<bool> CheckStorageWritableAsync()
    {
        try
        {
            var fileName = $"test_{Guid.NewGuid()}.tmp";
            using (var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("test")))
            {
                await attachmentStorage.SaveFileAsync(fileName, stream);
            }

            await attachmentStorage.DeleteFileAsync(fileName);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Storage write check failed.");
            return false;
        }
    }

    private async Task<bool> CheckDatabaseAsync()
    {
        try
        {
            // A tiny query to verify PostgreSQL connection works
            await db.Database.ExecuteSqlRawAsync("SELECT 1");
            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database test query failed.");
            return false;
        }
    }

    private static async Task<ServiceStatus> MeasureAsync(Func<Task<bool>> check)
    {
        var stopwatch = Stopwatch.StartNew();
        var reachable = await check();
        return new ServiceStatus(reachable, stopwatch.ElapsedMilliseconds);
    }

    private async Task<bool> CheckMessageQueueAsync()
    {
        var report = await healthCheckService.CheckHealthAsync(r => r.Name == "rabbitmq");
        return report.Status == HealthStatus.Healthy;
    }

    private async Task<bool> CheckRedisAsync()
    {
        try
        {
            var db = redis.GetDatabase();
            var pong = await db.PingAsync();
            return pong != TimeSpan.Zero;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis ping failed.");
            return false;
        }
    }

    [HttpGet("usage")]
    public async Task<IActionResult> GetUsage([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var end = (to ?? DateTime.UtcNow).ToUniversalTime();
        var start = (from ?? end.AddDays(-30)).ToUniversalTime();
        if (start >= end) return BadRequest(new { message = "'from' must be earlier than 'to'." });

        var data = await service.GetUsageAsync(start, end);
        return Ok(data);
    }

    [HttpGet("mail-settings")]
    public async Task<IActionResult> GetMailSettings()
    {
        var settings = await mailSettingsService.GetAsync();
        return Ok(settings);
    }

    [HttpPut("mail-settings")]
    public async Task<IActionResult> UpdateMailSettings([FromBody] MailSettingsUpdateRequest request)
    {
        var settings = await mailSettingsService.UpdateAsync(request);
        return Ok(settings);
    }

    [HttpGet("ai-settings")]
    public async Task<IActionResult> GetAiSettings()
    {
        var settings = await aiSettingsService.GetAsync();
        return Ok(settings);
    }

    [HttpPut("ai-settings")]
    public async Task<IActionResult> UpdateAiSettings([FromBody] AiSettingsUpdateRequest request)
    {
        try
        {
            var settings = await aiSettingsService.UpdateAsync(request);
            return Ok(settings);
        }
        catch (Exception exception) when (exception is ArgumentException or InvalidOperationException)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}

public sealed record ServiceStatus(bool Reachable, long LatencyMs);

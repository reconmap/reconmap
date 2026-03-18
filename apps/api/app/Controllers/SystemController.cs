using api_v2.Application.Services;
using api_v2.Common.Messaging;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace api_v2.Controllers;

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
        new() { Key = "targets", Description = "Targets" }, //ClassType = typeof(TargetsExporter) },
        new() { Key = "organisations", Description = "Organisations" }, //ClassType = typeof(ClientsExporter) },
        new() { Key = "users", Description = "Users" }, //ClassType = typeof(UsersExporter) },
        new()
        {
            Key = "vulnerabilities", Description = "Vulnerabilities"
        }, //ClassType = typeof(VulnerabilitiesExporter) },
        new()
        {
            Key = "vulnerability_categories", Description = "Vulnerability categories"
        }, //ClassType = typeof(VulnerabilityCategoriesExporter) },
        new()
        {
            Key = "vulnerability_templates", Description = "Vulnerability templates"
        } //ClassType = typeof(VulnerabilityTemplatesExporter) },
    };
}

[Route("api/[controller]")]
[ApiController]
public class SystemController(
    AppDbContext db,
    IConnectionMultiplexer redis,
    IMessageQueue messageQueue,
    ILogger<SystemController> logger,
    SystemUsageService service,
    IAttachmentStorage attachmentStorage)
    : ControllerBase
{
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
        // Check writing to attachments directory
        var attachmentsWritable = await CheckStorageWritableAsync();

        // Check MySQL connection (Pomelo)
        var dbReachable = await CheckDatabaseAsync();

        // Check Redis availability
        var redisReachable = await CheckRedisAsync();

        var result = new
        {
            attachmentsDirectory = attachmentsWritable,
            databaseServer = new { reachable = dbReachable },
            keyValueServer = new { reachable = redisReachable },
            messageQueueServer = new { reachable = true } // RabbitMQ
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
            // A tiny query to verify MySQL connection works
            await db.Database.ExecuteSqlRawAsync("SELECT 1");
            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database test query failed.");
            return false;
        }
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
    public async Task<IActionResult> GetUsage()
    {
        var data = await service.GetUsageAsync();
        return Ok(data);
    }
}

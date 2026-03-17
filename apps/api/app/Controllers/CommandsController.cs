using System.Security.Cryptography;
using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Common;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace api_v2.Controllers;

public class CommandProcessorJob
{
    public uint CommandUsageId { get; set; }
    public uint ProjectId { get; set; }
    public uint UserId { get; set; }
    public string FilePath { get; set; }
}

[Route("api/[controller]")]
[ApiController]
public class CommandsController(
    AppDbContext dbContext,
    IConnectionMultiplexer conn,
    IConfiguration config,
    ILogger<CommandsController> logger,
    IAttachmentStorage attachmentStorage)
    : ControllerBase
{
    private readonly AttachmentFilePath _attachmentFilePath = new();
    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] Command command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        command.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Commands.Add(command);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = command.Id }, command);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, Command command)
    {
        var dbModel = await dbContext.Commands.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(command);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await dbContext.SaveChangesAsync();
        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var q = dbContext.Commands.AsNoTracking()
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await q.CountAsync();

        var pagination = new PaginationRequestHandler(HttpContext.Request.Query, totalCount);
        var resultsPerPage = pagination.GetResultsPerPage();
        var pageCount = pagination.CalculatePageCount();

        var results = await q
            .Skip(pagination.CalculateOffset())
            .Take(resultsPerPage)
            .ToListAsync();

        return Ok(new
        {
            pageCount,
            totalCount,
            data = results
        });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var command = await dbContext.Commands
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (command == null) return NotFound();

        return Ok(command);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Command")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var deleteCount = await dbContext.Commands
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpGet("output-parsers")]
    public IActionResult GetOutputParsers()
    {
        var result = ProcessorIntegrationDiscovery.Discover(HttpContext.RequestServices)
            .Select(i => new
            {
                name = i.Name,
                code = i.Name.ToLowerInvariant()
            });

        return Ok(result);
    }


    [HttpPost("outputs")]
    public async Task<IActionResult> UploadOutput()
    {
        // Parsed body
        var form = await Request.ReadFormAsync();
        var commandUsageId = uint.Parse(form["commandUsageId"]);

        // Uploaded file
        var resultFile = form.Files["resultFile"];

        // Data lookups
        var usage = await dbContext.CommandUsages.FindAsync(commandUsageId);
        var command = await dbContext.Commands.FindAsync(usage.CommandId);

        // User Id from request context
        var userId = (int)HttpContext.GetCurrentUser()!.Id;

        var uniqueName = _attachmentFilePath.GenerateFileName(Path.GetExtension(resultFile.FileName));
        
        await using (var stream = resultFile.OpenReadStream())
        {
            await attachmentStorage.SaveFileAsync(uniqueName, stream);
        }

        var attachment = new Attachment
        {
            CreatedByUid = HttpContext.GetCurrentUser()!.Id,
            ParentType = "command",
            ParentId = command.Id,
            ClientFileName = resultFile.FileName,
            FileName = uniqueName,
            FileSize = (uint)resultFile.Length,
            FileMimeType = resultFile.ContentType,
            FileHash = await attachmentStorage.GetFileHashAsync(uniqueName)
        };

        await dbContext.Attachments.AddAsync(attachment);
        await dbContext.SaveChangesAsync();

        // Optional project ID
        int? projectId = null;
        if (form.TryGetValue("projectId", out var projectIdValue) &&
            int.TryParse(projectIdValue, out var parsedProjectId))
            projectId = parsedProjectId;

        if (projectId.HasValue)
        {
            var payload = new
            {
                commandUsageId,
                projectId = projectId.Value,
                userId,
                filePath = uniqueName
            };

            var pushed = await conn.GetDatabase().ListLeftPushAsync(
                "tasks:queue",
                JsonSerializer.Serialize(payload)
            );

            logger.LogInformation("pushed new job to {QueueName}", "tasks:queue");
        }

        return new JsonResult(new { success = true });
    }
}

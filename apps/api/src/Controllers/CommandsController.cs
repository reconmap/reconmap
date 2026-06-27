using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using api_v2.Application.Commands;
using api_v2.Application.Services;
using api_v2.Common;
using api_v2.Common.Extensions;
using api_v2.Common.Messaging;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace api_v2.Controllers;

public class CommandProcessorJob
{
    public string CommandUsageId { get; set; } = string.Empty;
    public uint ProjectId { get; set; }
    public uint UserId { get; set; }
    public string FilePath { get; set; } = string.Empty;
}

[Route("api/[controller]")]
[ApiController]
public class CommandsController(
    AppDbContext dbContext,
    IMessageQueue messageQueue,
    ILogger<CommandsController> logger,
    IAttachmentStorage attachmentStorage)
    : ControllerBase
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    [HttpGet]
    public IActionResult GetMany()
    {
        var query = HttpContext.Request.Query;
        string? keywords = query["keywords"];

        var allCommands = CommandDiscovery.GetAll();

        if (!string.IsNullOrWhiteSpace(keywords))
        {
            allCommands = allCommands.Where(c => 
                c.Name.Contains(keywords, StringComparison.OrdinalIgnoreCase) || 
                (c.Description != null && c.Description.Contains(keywords, StringComparison.OrdinalIgnoreCase))
            );
        }

        var results = allCommands.Select(c => new Command
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            MoreInfoUrl = c.MoreInfoUrl,
            Tags = string.Join(",", c.Tags)
        }).ToList();

        return Ok(new
        {
            pageCount = 1,
            totalCount = results.Count,
            data = results
        });
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GetOne(string id)
    {
        var cmdDef = CommandDiscovery.FindById(id);
        if (cmdDef == null) return NotFound();

        var command = new Command
        {
            Id = cmdDef.Id,
            Name = cmdDef.Name,
            Description = cmdDef.Description,
            MoreInfoUrl = cmdDef.MoreInfoUrl,
            Tags = string.Join(",", cmdDef.Tags)
        };

        return Ok(command);
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
        var form = await Request.ReadFormAsync();
        var commandUsageId = form["commandUsageId"].ToString();

        var resultFile = form.Files["resultFile"];
        if (resultFile == null) return BadRequest("Missing resultFile");

        var usage = CommandDiscovery.FindUsageById(commandUsageId);
        if (usage == null) return NotFound("Command usage not found");

        var command = CommandDiscovery.FindById(usage.CommandId);
        if (command == null) return NotFound("Command not found");

        int userId = 0;
        try
        {
            userId = (int)HttpContext.GetCurrentUser()!.Id;
        }
        catch
        {
            logger.LogInformation("upload command: user not found");
        }

        var uniqueName = _attachmentFilePath.GenerateFileName(Path.GetExtension(resultFile.FileName));

        await using (var stream = resultFile.OpenReadStream())
        {
            await attachmentStorage.SaveFileAsync(uniqueName, stream);
        }

        var attachment = new Attachment
        {
            CreatedByUid = (uint)userId,
            ParentType = "command",
            ParentId = 0,
            ClientFileName = resultFile.FileName,
            FileName = uniqueName,
            FileSize = (uint)resultFile.Length,
            FileMimeType = resultFile.ContentType,
            FileHash = await attachmentStorage.GetFileHashAsync(uniqueName)
        };

        await dbContext.Attachments.AddAsync(attachment);
        await dbContext.SaveChangesAsync();

        int? projectId = null;
        if (form.TryGetValue("projectId", out var projectIdValue) &&
            int.TryParse(projectIdValue, out var parsedProjectId))
            projectId = parsedProjectId;

        if (projectId.HasValue)
        {
            var job = new CommandProcessorJob
            {
                CommandUsageId = commandUsageId,
                ProjectId = (uint)projectId.Value,
                UserId = (uint)userId,
                FilePath = uniqueName
            };

            await messageQueue.PublishAsync("tasks", job);

            logger.LogInformation("pushed new job to tasks");
        }

        return new JsonResult(new { success = true });
    }
}

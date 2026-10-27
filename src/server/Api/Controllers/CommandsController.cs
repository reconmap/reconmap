using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Reconmap.Api.Application.Commands;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Common.Messaging;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Reconmap.Api.Infrastructure.Http;

namespace Reconmap.Api.Controllers;

public class CommandProcessorJob
{
    public string CommandUsageId { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
    public int? UserId { get; set; }
    public string FilePath { get; set; } = string.Empty;
}

[Route("api/[controller]")]
[ApiController]
public class CommandsController(
    AppDbContext dbContext,
    IMessageQueue messageQueue,
    ILogger<CommandsController> logger,
    IAttachmentStorage attachmentStorage,
    IOptions<StorageSettings> storageSettings)
    : ControllerBase
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    [HttpGet]
    public IActionResult GetMany()
    {
        var allCommands = CommandDiscovery.GetAll();

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
        var result = CommandParserDiscovery.Discover(HttpContext.RequestServices)
            .Select(i => new
            {
                name = i.Name,
                code = i.Name.ToLowerInvariant()
            });

        return Ok(result);
    }

    [HttpPost("outputs")]
    [UploadLimits(UploadKind.CommandOutput)]
    public async Task<IActionResult> UploadOutput()
    {
        var form = await Request.ReadFormAsync();
        var commandUsageId = form["commandUsageId"].ToString();

        var resultFile = form.Files["resultFile"];
        if (resultFile == null) return BadRequest("Missing resultFile");
        if (resultFile.Length > storageSettings.Value.Uploads.EffectiveMaxCommandOutputBytes)
            return StatusCode(StatusCodes.Status413PayloadTooLarge,
                new { message = "The command output exceeds the maximum upload size." });

        var usage = CommandDiscovery.FindUsageById(commandUsageId);
        if (usage == null) return NotFound("Command usage not found");

        var command = CommandDiscovery.FindById(usage.CommandId);
        if (command == null) return NotFound("Command not found");

        int? userId = null;
        try
        {
            userId = HttpContext.GetCurrentUser()!.Id;
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
            CreatedById = userId,
            ParentType = "command",
            ParentId = Guid.Empty,
            ClientFileName = resultFile.FileName,
            FileName = uniqueName,
            FileSize = (int)resultFile.Length, // bounded by EffectiveMaxCommandOutputBytes <= int.MaxValue
            FileMimeType = UploadContentTypes.FromFileName(resultFile.FileName),
            FileHash = await attachmentStorage.GetFileHashAsync(uniqueName)
        };

        await dbContext.Attachments.AddAsync(attachment);
        await dbContext.SaveChangesAsync();

        if (!form.TryGetValue("projectId", out var projectIdValue) ||
            !Guid.TryParse(projectIdValue, out var parsedProjectId))
        {
            return BadRequest("A project is required to save the findings.");
        }

        var job = new CommandProcessorJob
        {
            CommandUsageId = commandUsageId,
            ProjectId = parsedProjectId,
            UserId = userId,
            FilePath = uniqueName
        };

        await messageQueue.PublishAsync("tasks", job);

        logger.LogInformation("pushed new job to tasks");

        return new JsonResult(new { success = true });
    }

    [HttpPost("recommend")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RecommendTools(
        [FromBody] ToolRecommendationRequest request,
        [FromServices] IToolRecommendationService recommendationService)
    {
        var recommendations = await recommendationService.RecommendToolsAsync(request);
        return Ok(recommendations);
    }
}

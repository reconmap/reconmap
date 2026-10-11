using api_v2.Application.Commands;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Threading.Tasks;
using System.Linq;

namespace api_v2.Controllers;

[Route("api/commands")]
[ApiController]
public class CommandSchedulesController(
    AppDbContext dbContext,
    IConnectionMultiplexer conn,
    IConfiguration config,
    ILogger<CommandSchedulesController> logger)
    : ControllerBase
{
    [HttpGet("schedules")]
    public async Task<IActionResult> GetAll()
    {
        var page = await dbContext.CommandSchedules
            .Include(s => s.Project)
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        foreach (var schedule in page)
        {
            if (!string.IsNullOrEmpty(schedule.CommandId))
            {
                var cmdDef = CommandDiscovery.FindById(schedule.CommandId);
                if (cmdDef != null)
                {
                    schedule.Command = new Command
                    {
                        Id = cmdDef.Id,
                        Name = cmdDef.Name,
                        Description = cmdDef.Description,
                        MoreInfoUrl = cmdDef.MoreInfoUrl,
                        Tags = string.Join(",", cmdDef.Tags)
                    };
                }
            }
            if (!string.IsNullOrEmpty(schedule.CommandUsageId))
            {
                var usageDef = CommandDiscovery.FindUsageById(schedule.CommandUsageId);
                if (usageDef != null)
                {
                    schedule.CommandUsage = new CommandUsage
                    {
                        Id = usageDef.Id,
                        CommandId = usageDef.CommandId,
                        Description = usageDef.Description,
                        ExecutablePath = usageDef.ExecutablePath,
                        DockerImage = usageDef.DockerImage,
                        Arguments = usageDef.Arguments,
                        OutputCapturingMode = usageDef.OutputCapturingMode,
                        OutputFilename = usageDef.OutputFilename,
                        OutputParser = usageDef.OutputParser
                    };
                }
            }
        }

        return Ok(page);
    }

    [HttpGet("{commandId}/schedules")]
    public async Task<IActionResult> GetMany(string commandId)
    {
        var page = await dbContext.CommandSchedules
            .Where(s => s.CommandId == commandId)
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        foreach (var schedule in page)
        {
            if (!string.IsNullOrEmpty(schedule.CommandId))
            {
                var cmdDef = CommandDiscovery.FindById(schedule.CommandId);
                if (cmdDef != null)
                {
                    schedule.Command = new Command
                    {
                        Id = cmdDef.Id,
                        Name = cmdDef.Name,
                        Description = cmdDef.Description,
                        MoreInfoUrl = cmdDef.MoreInfoUrl,
                        Tags = string.Join(",", cmdDef.Tags)
                    };
                }
            }
            if (!string.IsNullOrEmpty(schedule.CommandUsageId))
            {
                var usageDef = CommandDiscovery.FindUsageById(schedule.CommandUsageId);
                if (usageDef != null)
                {
                    schedule.CommandUsage = new CommandUsage
                    {
                        Id = usageDef.Id,
                        CommandId = usageDef.CommandId,
                        Description = usageDef.Description,
                        ExecutablePath = usageDef.ExecutablePath,
                        DockerImage = usageDef.DockerImage,
                        Arguments = usageDef.Arguments,
                        OutputCapturingMode = usageDef.OutputCapturingMode,
                        OutputFilename = usageDef.OutputFilename,
                        OutputParser = usageDef.OutputParser
                    };
                }
            }
        }

        return Ok(page);
    }

    [HttpPost("{commandId}/schedules")]
    public async Task<IActionResult> CreateOne(string commandId, [FromBody] CommandSchedule commandSchedule)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        commandSchedule.CommandId = commandId;
        commandSchedule.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.CommandSchedules.Add(commandSchedule);
        await dbContext.SaveChangesAsync();

        return Created();
    }

    [HttpDelete("{commandId}/schedules/{id:int}")]
    [Audit(AuditActions.Deleted, "Command Schedule")]
    public async Task<IActionResult> DeleteOne(string commandId, int id)
    {
        var deleteCount = await dbContext.CommandSchedules
            .Where(n => n.CommandId == commandId && n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

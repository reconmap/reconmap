using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

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
    [HttpGet("{commandId:int}/schedules")]
    public async Task<IActionResult> GetMany(uint commandId)
    {
        var q = dbContext.CommandSchedules
            .Where(s => s.CommandId == commandId)
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt);

        var page = await q.ToListAsync();
        return Ok(page);
    }

    [HttpPost("{commandId:int}/schedules")]
    public async Task<IActionResult> CreateOne(uint commandId, [FromBody] CommandSchedule command)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        command.CommandId = commandId;
        command.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.CommandSchedules.Add(command);
        await dbContext.SaveChangesAsync();

        return Created();
    }

    [HttpDelete("{commandId:int}/schedules/{id:int}")]
    [Audit(AuditActions.Deleted, "Command Schedule")]
    public async Task<IActionResult> DeleteOne(uint commandId, int id)
    {
        var deleteCount = await dbContext.CommandSchedules
            .Where(n => n.CommandId == commandId && n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

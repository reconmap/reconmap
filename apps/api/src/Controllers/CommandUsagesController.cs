using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/commands/{commandId:int}/usages")]
[ApiController]
public class CommandUsagesController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(uint commandId, [FromBody] CommandUsage usage)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        usage.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.CommandUsages.Add(usage);
        await dbContext.SaveChangesAsync();

        return Created();
    }

    [HttpGet]
    public async Task<IActionResult> GetMany(int commandId, [FromQuery] int? limit)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit ?? 100, maxLimit);

        var q = dbContext.CommandUsages.AsNoTracking()
            .Where(u => u.CommandId == commandId)
            .OrderByDescending(a => a.CreatedAt);

        var page = await q.Take(take).ToListAsync();
        return Ok(page);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var entity = await dbContext.CommandUsages.FindAsync(id);
        if (entity == null) return NotFound();

        return Ok(entity);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Command Usage")]
    public async Task<IActionResult> DeleteOne(int commandId, int id)
    {
        var deleteCount = await dbContext.CommandUsages
            .Where(n => n.CommandId == commandId && n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

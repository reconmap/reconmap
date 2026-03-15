using System.Text.Json;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TasksController(AppDbContext dbContext) : AppController(dbContext)
{
    [HttpPost]
    public async Task<IActionResult> CreateOne(ProjectTask task)
    {
        task.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Tasks.Add(task);

        AuditAction(AuditActions.Created, "Task", new { id = task.Id });
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = task.Id }, task);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, ProjectTask requestModel)
    {
        var dbModel = await dbContext.Tasks.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(requestModel);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;

        await dbContext.SaveChangesAsync();
        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit,
        [FromQuery] uint? projectId,
        [FromQuery] string? priority,
        [FromQuery] string? status)
    {
        var q = dbContext.Tasks
            .Include(t => t.AssignedTo)
            .AsNoTracking()
            .Where(t => string.IsNullOrEmpty(priority) || t.Priority == priority)
            .Where(t => string.IsNullOrEmpty(status) || t.Status == status);
        if (projectId != null)
            q = q.Where(t => t.ProjectId == projectId);
        q = q.OrderByDescending(a => a.CreatedAt);

        var tasks = await q.ToListAsync();
        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var existing = await dbContext.Tasks
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Task")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await dbContext.Tasks
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpPatch]
    public async Task<IActionResult> PatchMany(
        [FromHeader(Name = "Bulk-Operation")] string operation,
        [FromBody] JsonElement body)
    {
        var ids = body.GetProperty("ids")
            .EnumerateArray()
            .Select(e => e.GetUInt32())
            .ToList();

        switch (operation)
        {
            case "UPDATE":
                var status = body.GetProperty("newStatus").GetString();

                await dbContext.Tasks
                    .Where(t => ids.Contains(t.Id))
                    .ExecuteUpdateAsync(u => u.SetProperty(
                        t => t.Status,
                        t => status
                    ));

                break;

            case "DELETE":
                await dbContext.Tasks
                    .Where(t => ids.Contains(t.Id))
                    .ExecuteDeleteAsync();

                break;

            default:
                return BadRequest(new { message = "Unknown bulk operation." });
        }

        return Accepted();
    }
}

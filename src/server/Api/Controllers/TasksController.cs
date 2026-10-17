using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TasksController(AppDbContext dbContext, ITaskService taskService) : AppController(dbContext)
{
    [HttpPost]
    [Audit(AuditActions.Created, "Task")]
    public async Task<IActionResult> CreateOne(ProjectTask task)
    {
        task.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Tasks.Add(task);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id = task.Id };

        return CreatedAtAction(nameof(GetOne), new { id = task.Id }, task);
    }

    [HttpPut("{id:int}")]
    [Audit(AuditActions.Updated, "Task")]
    public async Task<IActionResult> UpdateOne(int id, ProjectTask requestModel)
    {
        var dbModel = await dbContext.Tasks.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(requestModel);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;

        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit,
        [FromQuery] int? projectId,
        [FromQuery] string? priority,
        [FromQuery] string? status,
        [FromQuery] string? keywords,
        [FromQuery] int? assignedToUid = null,
        [FromQuery] int? projectIsArchived = null)
    {
        var tasks = await taskService.GetManyAsync(new TaskFilter(
            limit, projectId, priority, status, keywords, assignedToUid, projectIsArchived));
        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(int id)
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
            .Select(e => e.GetInt32())
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

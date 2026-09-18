using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using api_v2.Infrastructure.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotesController(AppDbContext dbContext, ILogger<NotesController> logger, IRequestAccessScope accessScope)
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOne(Note note)
    {
        if (!await accessScope.CanAccessParentAsync(note.ParentType!, note.ParentId)) return NotFound();
        note.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Notes.Add(note);
        await dbContext.SaveChangesAsync();

        return Created();
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit,
        [FromQuery] string parentType,
        [FromQuery] int parentId)
    {
        if (!await accessScope.CanAccessParentAsync(parentType, parentId)) return NotFound();
        var q = dbContext.Notes
            .Include(n => n.CreatedBy)
            .AsNoTracking()
            .Where(n => n.ParentType == parentType && n.ParentId == parentId)
            .OrderByDescending(a => a.CreatedAt);

        var notes = await q.ToListAsync();
        return Ok(notes);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Comment")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var note = await dbContext.Notes.FindAsync(id);
        if (note == null || !await accessScope.CanAccessParentAsync(note.ParentType!, note.ParentId)) return NotFound();
        dbContext.Notes.Remove(note);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

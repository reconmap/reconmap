using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotesController(AppDbContext dbContext, IRequestAccessScope accessScope)
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOne(Note note)
    {
        if (!await accessScope.CanAccessParentAsync(note.ParentType!, note.ParentId)) return NotFound();
        note.CreatedById = HttpContext.GetCurrentUser()!.Id;
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

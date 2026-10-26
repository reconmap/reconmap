using System.ComponentModel.DataAnnotations;
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
public class CommentsController(AppDbContext dbContext, IRequestAccessScope accessScope)
    : ControllerBase
{
    public sealed class CreateCommentRequest
    {
        [Required] public CommentParentType ParentType { get; set; }

        [Required] public Guid ParentId { get; set; }

        [Required] public string Content { get; set; } = string.Empty;
    }

    public sealed record CommentResponse(
        int Id,
        string? ParentType,
        Guid ParentId,
        string Content,
        int? CreatedById,
        DateTime? CreatedAt,
        User? CreatedBy);

    [HttpPost]
    [Audit(AuditActions.Created, "Comment")]
    public async Task<IActionResult> CreateOne(CreateCommentRequest request)
    {
        var parentType = request.ParentType.ToString().ToLowerInvariant();
        if (!await accessScope.CanAccessParentAsync(parentType, request.ParentId)) return NotFound();

        var comment = new Comment
        {
            ParentType = parentType,
            ParentId = request.ParentId,
            Content = request.Content,
            CreatedById = HttpContext.GetCurrentUser()!.Id
        };
        dbContext.Comments.Add(comment);
        await dbContext.SaveChangesAsync();
        await dbContext.Entry(comment).Reference(c => c.CreatedBy).LoadAsync();

        HttpContext.Items["AuditData"] = new { id = comment.Id };

        return Created($"/api/comments/{comment.Id}", ToResponse(comment));
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit,
        [FromQuery] string parentType,
        [FromQuery] Guid parentId)
    {
        if (!Enum.TryParse<CommentParentType>(parentType, ignoreCase: true, out var type))
        {
            return BadRequest($"Unsupported parent type '{parentType}'.");
        }

        var normalisedParentType = type.ToString().ToLowerInvariant();
        if (!await accessScope.CanAccessParentAsync(normalisedParentType, parentId)) return NotFound();

        IQueryable<Comment> q = dbContext.Comments
            .Include(c => c.CreatedBy)
            .AsNoTracking()
            .Where(c => c.ParentType == normalisedParentType && c.ParentId == parentId)
            .OrderByDescending(c => c.CreatedAt);

        if (limit is > 0) q = q.Take(limit.Value);

        var comments = await q.ToListAsync();
        return Ok(comments.Select(ToResponse));
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Comment")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var comment = await dbContext.Comments.FindAsync(id);
        if (comment == null || !await accessScope.CanAccessParentAsync(comment.ParentType!, comment.ParentId)) return NotFound();

        if (comment.CreatedById != accessScope.UserId && !accessScope.IsPrivileged) return Forbid();

        dbContext.Comments.Remove(comment);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    private static CommentResponse ToResponse(Comment comment) =>
        new(comment.Id, comment.ParentType, comment.ParentId, comment.Content, comment.CreatedById, comment.CreatedAt, comment.CreatedBy);
}

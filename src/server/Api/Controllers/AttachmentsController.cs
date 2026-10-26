using System.Security.Cryptography;
using Reconmap.Api.Application.Services;
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
public class AttachmentsController(AppDbContext dbContext, IAttachmentStorage attachmentStorage, IRequestAccessScope accessScope)
    : AppController(dbContext)
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    [HttpGet]
    public async Task<IActionResult> GetMany(
        [FromQuery] string parentType,
        [FromQuery] Guid parentId)
    {
        if (!await accessScope.CanAccessParentAsync(parentType, parentId)) return NotFound();
        var q = dbContext.Attachments.AsNoTracking()
            .Include(a => a.CreatedBy)
            .Where(a => a.ParentType == parentType && a.ParentId == parentId)
            .OrderByDescending(a => a.CreatedAt);

        var attachments = await q.ToListAsync();
        return Ok(attachments);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(int id)
    {
        var attachment = await dbContext.Attachments.FindAsync(id);
        if (attachment == null) return NotFound();
        if (!await accessScope.CanAccessParentAsync(attachment.ParentType!, attachment.ParentId)) return NotFound();

        var stream = await attachmentStorage.GetFileStreamAsync(attachment.FileName);

        Response.Headers.AccessControlExposeHeaders = "Content-Disposition";

        AuditAction(AttachmentAuditActions.Downloaded, "Attachment", new { attachment.ClientFileName });

        return File(
            stream,
            attachment.FileMimeType,
            attachment.ClientFileName,
            true // allows efficient large-file downloads
        );
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Attachment")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var attachment = await dbContext.Attachments.FindAsync(id);
        if (attachment == null) return NotFound();
        if (!await accessScope.CanAccessParentAsync(attachment.ParentType!, attachment.ParentId)) return NotFound();

        await attachmentStorage.DeleteFileAsync(attachment.FileName);

        dbContext.Attachments.Remove(attachment);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
    public async Task<IActionResult> CreateMany([FromForm] Guid parentId, [FromForm] string parentType)
    {
        if (!Request.Form.Files.Any())
            return BadRequest();
        if (!await accessScope.CanAccessParentAsync(parentType, parentId)) return NotFound();

        foreach (var file in Request.Form.Files)
        {
            var uniqueName = _attachmentFilePath.GenerateFileName(Path.GetExtension(file.FileName));
            
            await using (var stream = file.OpenReadStream())
            {
                await attachmentStorage.SaveFileAsync(uniqueName, stream);
            }

            var attachment = new Attachment
            {
                CreatedById = HttpContext.GetCurrentUser()!.Id,
                ParentType = parentType,
                ParentId = parentId,
                ClientFileName = file.FileName,
                FileName = uniqueName,
                FileSize = (int)file.Length,
                FileMimeType = file.ContentType,
                FileHash = await attachmentStorage.GetFileHashAsync(uniqueName)
            };

            await dbContext.Attachments.AddAsync(attachment);
        }

        await dbContext.SaveChangesAsync();

        return Ok();
    }
}

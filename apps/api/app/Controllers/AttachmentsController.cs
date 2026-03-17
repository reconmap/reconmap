using System.Security.Cryptography;
using api_v2.Application.Services;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AttachmentsController(AppDbContext dbContext, ILogger<AttachmentsController> logger, IAttachmentStorage attachmentStorage)
    : AppController(dbContext)
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    [HttpGet]
    public async Task<IActionResult> GetMany(
        [FromQuery] string parentType,
        [FromQuery] int parentId)
    {
        var q = dbContext.Attachments.AsNoTracking()
            .Where(a => a.ParentType == parentType && a.ParentId == parentId)
            .OrderByDescending(a => a.CreatedAt);

        var attachments = await q.ToListAsync();
        return Ok(attachments);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var attachment = await dbContext.Attachments.FindAsync(id);
        if (attachment == null) return NotFound();

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
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var attachment = await dbContext.Attachments.FindAsync(id);
        if (attachment == null) return NotFound();

        await attachmentStorage.DeleteFileAsync(attachment.FileName);

        dbContext.Attachments.Remove(attachment);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
    public async Task<IActionResult> CreateMany([FromForm] uint parentId, [FromForm] string parentType)
    {
        if (!Request.Form.Files.Any())
            return BadRequest();

        foreach (var file in Request.Form.Files)
        {
            var uniqueName = _attachmentFilePath.GenerateFileName(Path.GetExtension(file.FileName));
            
            await using (var stream = file.OpenReadStream())
            {
                await attachmentStorage.SaveFileAsync(uniqueName, stream);
            }

            var attachment = new Attachment
            {
                CreatedByUid = HttpContext.GetCurrentUser()!.Id,
                ParentType = parentType,
                ParentId = parentId,
                ClientFileName = file.FileName,
                FileName = uniqueName,
                FileSize = (uint)file.Length,
                FileMimeType = file.ContentType,
                FileHash = await attachmentStorage.GetFileHashAsync(uniqueName)
            };

            await dbContext.Attachments.AddAsync(attachment);
        }

        await dbContext.SaveChangesAsync();

        return Ok();
    }
}

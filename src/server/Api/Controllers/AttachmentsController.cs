using System.Security.Cryptography;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reconmap.Api.Common;
using Reconmap.Api.Infrastructure.Http;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AttachmentsController(AppDbContext dbContext, IAttachmentStorage attachmentStorage, IRequestAccessScope accessScope, IOptions<StorageSettings> storageSettings)
    : AppController(dbContext)
{
    private readonly AttachmentFilePath _attachmentFilePath = new();
    private readonly UploadSettings _uploads = storageSettings.Value.Uploads;

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
            // Never echo the client-declared type: derive it from the stored name.
            UploadContentTypes.FromFileName(attachment.ClientFileName),
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
    [UploadLimits(UploadType.Attachment)]
    public async Task<IActionResult> CreateMany([FromForm] Guid parentId, [FromForm] string parentType)
    {
        var files = Request.Form.Files;
        if (files.Count == 0)
            return BadRequest();
        if (files.Count > _uploads.EffectiveMaxFilesPerRequest)
            return BadRequest(new { message = $"At most {_uploads.EffectiveMaxFilesPerRequest} files can be uploaded at once." });
        if (!await accessScope.CanAccessParentAsync(parentType, parentId)) return NotFound();

        var allowedExtensions = _uploads.EffectiveAllowedExtensions();
        var maxFileSize = _uploads.EffectiveMaxFileSizeBytes;
        foreach (var file in files)
        {
            if (file.Length > maxFileSize)
                return StatusCode(StatusCodes.Status413PayloadTooLarge,
                    new { message = $"'{file.FileName}' exceeds the maximum file size of {maxFileSize} bytes." });
            if (!allowedExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()))
                return StatusCode(StatusCodes.Status415UnsupportedMediaType,
                    new { message = $"'{file.FileName}' has a file type that is not allowed." });
        }

        foreach (var file in files)
        {
            var uniqueName = _attachmentFilePath.GenerateFileName(Path.GetExtension(file.FileName).ToLowerInvariant());
            
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
                FileSize = (int)file.Length, // bounded by EffectiveMaxFileSizeBytes <= int.MaxValue
                FileMimeType = UploadContentTypes.FromFileName(file.FileName),
                FileHash = await attachmentStorage.GetFileHashAsync(uniqueName)
            };

            await dbContext.Attachments.AddAsync(attachment);
        }

        await dbContext.SaveChangesAsync();

        return Ok();
    }
}

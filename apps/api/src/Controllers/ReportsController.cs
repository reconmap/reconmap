using System.Security.Cryptography;
using System.Net.Mail;
using api_v2.Application.Services;
using api_v2.Common.Extensions;
using api_v2.Common.Messaging;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scriban;

namespace api_v2.Controllers;



public class ReportRequestDto
{
    public uint ProjectId { get; set; }
    public uint ReportTemplateId { get; set; }
    public string VersionName { get; set; }
    public string VersionDescription { get; set; }
}

public class ReportSendRequestDto
{
    public string? Recipients { get; set; }
    public string? RecipientsGroup { get; set; }
    public string? Subject { get; set; }
    public string? Body { get; set; }
}

[Route("api/[controller]")]
[ApiController]
public class ReportsController(
    AppDbContext dbContext,
    ILogger<ReportsController> logger,
    IAttachmentStorage attachmentStorage,
    IMessageQueue messageQueue,
    IMailSettingsService mailSettingsService)
    : AppController(dbContext)
{
    private readonly AttachmentFilePath _attachmentFilePath = new();
    private readonly ILogger _logger = logger;

    [HttpPost]
    public async Task<IActionResult> Create(ReportRequestDto reportRequest)
    {
        var project = await dbContext.Projects.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == reportRequest.ProjectId);
        if (project == null) return NotFound();

        var templateAttachment = await dbContext.Attachments
            .Where(a => a.ParentId == reportRequest.ReportTemplateId && a.ParentType == "report")
            .FirstOrDefaultAsync();
        if (templateAttachment == null) return NotFound();

        var report = new Report
        {
            CreatedByUid = HttpContext.GetCurrentUser()!.Id,
            ProjectId = reportRequest.ProjectId,
            VersionName = reportRequest.VersionName,
            VersionDescription = reportRequest.VersionDescription,
            IsTemplate = false
        };
        dbContext.Reports.Add(report);
        await dbContext.SaveChangesAsync();

        await messageQueue.PublishAsync("report-generation", new ReportGenerationJob
        {
            ReportId = report.Id,
            ProjectId = report.ProjectId.Value,
            ReportTemplateId = reportRequest.ReportTemplateId,
            CreatedByUserId = report.CreatedByUid
        });

        return AcceptedAtAction(nameof(GetMany), new { id = report.Id }, report);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit, [FromQuery] uint? projectId)
    {
        var results = await GetReportsInternal(limit, false, projectId);
        return Ok(results);
    }

    [HttpGet("{id:int}/preview")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PreviewReport(uint id)
    {
        var existing = await dbContext.Projects.FindAsync(id);
        if (existing == null) return NotFound();

        var client = await dbContext.Organisations.FindAsync(existing.ClientId);

        string data;
        await using (var templateStream = await attachmentStorage.GetFileStreamAsync("default-report-template.html"))
        {
            using (var reader = new StreamReader(templateStream))
            {
                data = await reader.ReadToEndAsync();
            }
        }

        var tpl = Template.Parse(data);
        var res = await tpl.RenderAsync(new { project = existing, client });

        var result = new ContentResult
        {
            Content = res,
            ContentType = "text/html; charset=utf-8"
        };
        return result;
    }


    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates([FromQuery] int? limit)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit ?? 100, maxLimit);
        var results = await GetReportsInternal(limit, true);
        return Ok(results);
    }

    [HttpPost("{id:int}/send")]
    public async Task<IActionResult> Send(uint id, [FromBody] ReportSendRequestDto request)
    {
        var report = await dbContext.Reports
            .AsNoTracking()
            .SingleOrDefaultAsync(r => r.Id == id && !r.IsTemplate);
        if (report == null) return NotFound();

        if (!report.ProjectId.HasValue)
            return BadRequest(new { message = "Only project reports can be sent by email." });

        var attachment = await dbContext.Attachments
            .AsNoTracking()
            .SingleOrDefaultAsync(a => a.ParentType == "report" && a.ParentId == report.Id);
        if (attachment == null)
            return BadRequest(new { message = "The selected report does not have an attachment to send." });

        var project = await dbContext.Projects
            .AsNoTracking()
            .SingleOrDefaultAsync(p => p.Id == report.ProjectId.Value);
        if (project == null)
            return BadRequest(new { message = "The report is not linked to a valid project." });

        List<string> recipients;
        try
        {
            recipients = await ResolveRecipientsAsync(project, request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        if (recipients.Count == 0)
            return BadRequest(new { message = "No valid recipients were found for this report email." });

        try
        {
            await mailSettingsService.GetSmtpSettingsAsync();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        await messageQueue.PublishAsync("report-emails", new ReportEmailJob
        {
            ReportId = report.Id,
            RequestedByUserId = HttpContext.GetCurrentUser()!.Id,
            Recipients = recipients,
            Subject = string.IsNullOrWhiteSpace(request.Subject)
                ? "[CONFIDENTIAL] Security report attached"
                : request.Subject.Trim(),
            Body = request.Body?.Trim() ?? "Please review attachment containing a security report."
        });

        return Accepted(new
        {
            queued = true,
            reportId = report.Id,
            recipientsCount = recipients.Count,
            attachment = attachment.ClientFileName
        });
    }

    private async Task<List<object>> GetReportsInternal(int? limit, bool isTemplate, uint? projectId = null)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit ?? 100, maxLimit);

        var query =
            from r in dbContext.Reports
            join a in dbContext.Attachments
                on new { r.Id, Type = "report" }
                equals new { Id = a.ParentId, Type = a.ParentType } into attachments
            from a in attachments.DefaultIfEmpty()
            where r.IsTemplate == isTemplate
            orderby r.CreatedAt descending
            select new
            {
                // report fields
                r.Id,
                r.ProjectId,
                r.CreatedByUid,
                r.CreatedAt,
                r.IsTemplate,
                r.VersionName,
                r.VersionDescription,

                // attachment fields
                AttachmentId = (uint?)a.Id,
                AttachmentInsertTs = (DateTime?)a.CreatedAt,
                ClientFileName = a.ClientFileName,
                FileName = a.FileName,
                FileSize = (uint?)a.FileSize,
                FileMimeType = a.FileMimeType
            };

        if (!isTemplate && projectId.HasValue)
            query = query.Where(r => r.ProjectId == projectId.Value);

        return await query
            .Take(take)
            .ToListAsync<object>();
    }

    private async Task<List<string>> ResolveRecipientsAsync(Project project, ReportSendRequestDto request)
    {
        var group = string.IsNullOrWhiteSpace(request.RecipientsGroup)
            ? "all_contacts"
            : request.RecipientsGroup.Trim();

        if (group == "specific_emails")
            return ParseRecipientList(request.Recipients);

        if (!project.ClientId.HasValue)
            throw new InvalidOperationException("The project does not have a client organisation configured.");

        var contacts = dbContext.Contacts
            .AsNoTracking()
            .Where(c => c.OrganisationId == project.ClientId.Value);

        contacts = group switch
        {
            "all_contacts" => contacts,
            "all_general_contacts" => contacts.Where(c => c.Kind == ContactKind.general.ToString()),
            "all_technical_contacts" => contacts.Where(c => c.Kind == ContactKind.technical.ToString()),
            "all_billing_contacts" => contacts.Where(c => c.Kind == ContactKind.billing.ToString()),
            _ => throw new InvalidOperationException("The selected recipients group is not supported.")
        };

        return (await contacts
                .Select(c => c.Email)
                .ToListAsync())
            .Select(email => email.Trim())
            .Where(IsValidEmail)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static List<string> ParseRecipientList(string? recipients)
    {
        var parsedRecipients = (recipients ?? string.Empty)
            .Split([',', ';', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(IsValidEmail)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (parsedRecipients.Count == 0)
            throw new InvalidOperationException("Add at least one valid recipient email address.");

        return parsedRecipients;
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            _ = new System.Net.Mail.MailAddress(email);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Report")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var deleted = await dbContext.Reports
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleted == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

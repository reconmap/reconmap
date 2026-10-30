using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Common.Messaging;
using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FindingsController(
    AppDbContext dbContext,
    IMessageQueue messageQueue,
    IRequestAccessScope accessScope,
    IFindingService findingService)
    : AppController(dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpPost]
    [Audit(AuditActions.Created, "Finding")]
    public async Task<IActionResult> CreateOne(Finding finding)
    {
        finding.CreatedById = HttpContext.GetCurrentUser()!.Id;
        _dbContext.Findings.Add(finding);
        await _dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id = finding.Id };

        await messageQueue.PublishAsync("findings",
            new { @event = "finding.created", payload = finding });
        await messageQueue.PublishAsync("webhooks",
            new { @event = "finding.created", payload = finding });

        return CreatedAtAction(nameof(GetOne), new { id = finding.Id }, finding);
    }

    [HttpPut("{id:guid}")]
    [Audit(AuditActions.Updated, "Finding")]
    public async Task<IActionResult> UpdateOne(Guid id, Finding finding)
    {
        var dbModel = await _dbContext.Findings.FindAsync(id);
        if (dbModel == null) return NotFound();

        _dbContext.Entry(dbModel).CurrentValues.SetValues(finding);
        _dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await _dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany(
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? assetId,
        [FromQuery] string? status,
        [FromQuery] string? risk,
        [FromQuery] string? keywords,
        [FromQuery] bool? isTemplate)
    {
        var visibleProjectIds = accessScope.IsPrivileged ? null : await accessScope.MemberProjectIdsAsync();
        var filter = new FindingFilter(projectId, assetId, status, risk, keywords, isTemplate, visibleProjectIds);

        var pagination = new PaginationRequestHandler(HttpContext.Request.Query);
        var page = await findingService.GetManyAsync(filter,
            new Paging(pagination.CalculateOffset(), pagination.GetResultsPerPage()));

        var totalCount = page.TotalCount;
        var results = page.Data;
        var pageCount = new PaginationRequestHandler(HttpContext.Request.Query, totalCount).CalculatePageCount();

        return Ok(new
        {
            pageCount,
            totalCount,
            data = results
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var existing = await _dbContext.Findings
            .Include(v => v.Project)
            .Include(v => v.Category)
            .Include(v => v.CreatedBy)
            .Include(v => v.Asset)
            .Where(v => v.Id == id)
            .FirstOrDefaultAsync();
        if (existing == null) return NotFound();
        if (!await accessScope.CanAccessProjectAsync(existing.ProjectId)) return NotFound();

        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    [Audit(AuditActions.Deleted, "Finding")]
    public async Task<IActionResult> DeleteOne(Guid id)
    {
        var deleteCount = await _dbContext.Findings
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpPut]
    [Route("{id:guid}/remediation")]
    public async Task<IActionResult> PutRemediation(
        Guid id,
        [FromServices] IAiService aiService)
    {
        var finding = await _dbContext.Findings.FindAsync(id);

        finding.Remediation =
            await aiService.GenerateRemediationAsync(
                finding.Summary, finding.ProjectId, HttpContext.GetCurrentUser()?.Id);
        _dbContext.Findings.Update(finding);
        await _dbContext.SaveChangesAsync();

        var notification = new Notification
        {
            ToUserId = HttpContext.GetCurrentUser().Id,
            Title = "Job completed",
            Content =
                "The finding remediation instructions have now been generated",
            Status = "unread"
        };
        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        await messageQueue.PublishAsync("notifications", new { type = "message" });

        return Ok();
    }

    [HttpPost]
    [Route("{id:guid}/triage")]
    public async Task<IActionResult> PostTriage(
        Guid id,
        [FromServices] IAiService aiService)
    {
        var finding = await _dbContext.Findings
            .AsNoTracking()
            .Where(v => v.Id == id)
            .FirstOrDefaultAsync();

        if (finding == null) return NotFound();

        var triage = await aiService.TriageFindingAsync(
            finding.Summary,
            finding.Description ?? string.Empty,
            finding.ProjectId,
            HttpContext.GetCurrentUser()?.Id);

        return Ok(new { triage });
    }
}

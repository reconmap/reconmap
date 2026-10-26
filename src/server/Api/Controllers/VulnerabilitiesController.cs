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
public class VulnerabilitiesController(
    AppDbContext dbContext,
    IMessageQueue messageQueue,
    IRequestAccessScope accessScope,
    IVulnerabilityService vulnerabilityService)
    : AppController(dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpPost]
    [Audit(AuditActions.Created, "Vulnerability")]
    public async Task<IActionResult> CreateOne(Vulnerability vulnerability)
    {
        vulnerability.CreatedById = HttpContext.GetCurrentUser()!.Id;
        _dbContext.Vulnerabilities.Add(vulnerability);
        await _dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id = vulnerability.Id };

        await messageQueue.PublishAsync("vulnerabilities",
            new { @event = "vulnerability.created", payload = vulnerability });
        await messageQueue.PublishAsync("webhooks",
            new { @event = "vulnerability.created", payload = vulnerability });

        return CreatedAtAction(nameof(GetOne), new { id = vulnerability.Id }, vulnerability);
    }

    [HttpPut("{id:guid}")]
    [Audit(AuditActions.Updated, "Vulnerability")]
    public async Task<IActionResult> UpdateOne(Guid id, Vulnerability vulnerability)
    {
        var dbModel = await _dbContext.Vulnerabilities.FindAsync(id);
        if (dbModel == null) return NotFound();

        _dbContext.Entry(dbModel).CurrentValues.SetValues(vulnerability);
        _dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await _dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany(
        [FromQuery] Guid? projectId,
        [FromQuery] int? assetId,
        [FromQuery] string? status,
        [FromQuery] string? risk,
        [FromQuery] string? keywords,
        [FromQuery] bool? isTemplate)
    {
        var visibleProjectIds = accessScope.IsPrivileged ? null : await accessScope.MemberProjectIdsAsync();
        var filter = new VulnerabilityFilter(projectId, assetId, status, risk, keywords, isTemplate, visibleProjectIds);

        var pagination = new PaginationRequestHandler(HttpContext.Request.Query);
        var page = await vulnerabilityService.GetManyAsync(filter,
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
        var existing = await _dbContext.Vulnerabilities
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
    [Audit(AuditActions.Deleted, "Vulnerability")]
    public async Task<IActionResult> DeleteOne(Guid id)
    {
        var deleteCount = await _dbContext.Vulnerabilities
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
        var vulnerability = await _dbContext.Vulnerabilities.FindAsync(id);

        vulnerability.Remediation =
            await aiService.GenerateRemediationAsync(
                vulnerability.Summary, vulnerability.ProjectId, HttpContext.GetCurrentUser()?.Id);
        _dbContext.Vulnerabilities.Update(vulnerability);
        await _dbContext.SaveChangesAsync();

        var notification = new Notification
        {
            ToUserId = HttpContext.GetCurrentUser().Id,
            Title = "Job completed",
            Content =
                "The vulnerability remediation instructions have now been generated",
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
        var vulnerability = await _dbContext.Vulnerabilities
            .AsNoTracking()
            .Where(v => v.Id == id)
            .FirstOrDefaultAsync();

        if (vulnerability == null) return NotFound();

        var triage = await aiService.TriageVulnerabilityAsync(
            vulnerability.Summary,
            vulnerability.Description ?? string.Empty,
            vulnerability.ProjectId,
            HttpContext.GetCurrentUser()?.Id);

        return Ok(new { triage });
    }
}

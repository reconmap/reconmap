using System.Text.Json;
using api_v2.Common;
using api_v2.Common.Extensions;
using api_v2.Common.Messaging;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VulnerabilitiesController(
    AppDbContext dbContext,
    ILogger<VulnerabilitiesController> logger,
    IMessageQueue messageQueue,
    IConnectionMultiplexer redisConnections)
    : AppController(dbContext)
{
    private readonly AppDbContext _dbContext = dbContext;

    [HttpPost]
    public async Task<IActionResult> CreateOne(Vulnerability vulnerability)
    {
        vulnerability.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        _dbContext.Vulnerabilities.Add(vulnerability);

        AuditAction(AuditActions.Created, "Vulnerability", new { id = vulnerability.Id });
        await _dbContext.SaveChangesAsync();

        await messageQueue.PublishAsync("findings",
            new { @event = "finding.created", payload = vulnerability });
        await messageQueue.PublishAsync("webhooks",
            new { @event = "finding.created", payload = vulnerability });

        return CreatedAtAction(nameof(GetOne), new { id = vulnerability.Id }, vulnerability);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, Vulnerability vulnerability)
    {
        var dbModel = await _dbContext.Vulnerabilities.FindAsync(id);
        if (dbModel == null) return NotFound();

        _dbContext.Entry(dbModel).CurrentValues.SetValues(vulnerability);
        _dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await _dbContext.SaveChangesAsync();
        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany(
        [FromQuery] int? projectId,
        [FromQuery] int? assetId,
        [FromQuery] string? status,
        [FromQuery] string? risk)
    {
        var q = _dbContext.Vulnerabilities
             .Include(v => v.Project)
             .Include(v => v.Asset)
             .AsNoTracking()
             .Where(v => string.IsNullOrEmpty(risk) || v.Risk == risk);
         if (projectId.HasValue)
             q = q.Where(v => v.ProjectId == projectId);
         if(assetId.HasValue)
             q = q.Where(v => v.AssetId == assetId);
        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(v => v.Status == status);
        q = q.OrderByDescending(a => a.CreatedAt);

        var totalCount = await q.CountAsync();

        var pagination = new PaginationRequestHandler(HttpContext.Request.Query, totalCount);
        var resultsPerPage = pagination.GetResultsPerPage();
        var pageCount = pagination.CalculatePageCount();

        var results = await q
            .Skip(pagination.CalculateOffset())
            .Take(resultsPerPage)
            .ToListAsync();

        return Ok(new
        {
            pageCount,
            totalCount,
            data = results
        });
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var existing = await _dbContext.Vulnerabilities
            .Include(v => v.Project)
            .Include(v => v.Category)
            .Include(v => v.CreatedBy)
            .Include(v => v.Asset)
            .Where(v => v.Id == id)
            .FirstOrDefaultAsync();
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Vulnerability")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await _dbContext.Vulnerabilities
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpPut]
    [Route("{id:int}/remediation")]
    public async Task<IActionResult> PutRemediation(
        uint id,
        [FromServices] IAiService aiService)
    {
        var vulnerability = await _dbContext.Vulnerabilities.FindAsync(id);

        vulnerability.Remediation =
            await aiService.GenerateRemediationAsync(vulnerability.Summary);
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
}

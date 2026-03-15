using System.Text.Json;
using api_v2.Common;
using api_v2.Common.Extensions;
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
    IConnectionMultiplexer redisConnections)
    : AppController(dbContext)
{
    [HttpPost]
    public async Task<IActionResult> CreateOne(Vulnerability vulnerability)
    {
        vulnerability.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Vulnerabilities.Add(vulnerability);

        AuditAction(AuditActions.Created, "Vulnerability", new { id = vulnerability.Id });
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = vulnerability.Id }, vulnerability);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, Vulnerability vulnerability)
    {
        var dbModel = await dbContext.Vulnerabilities.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(vulnerability);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await dbContext.SaveChangesAsync();
        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? projectId,
        [FromQuery] string? status,
        [FromQuery] string? risk)
    {
        var q = dbContext.Vulnerabilities
            .Include(v => v.Project)
            .AsNoTracking()
            .Where(v => string.IsNullOrEmpty(risk) || v.Risk == risk);
        if (projectId.HasValue)
            q = q.Where(v => v.ProjectId == projectId);
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
        var existing = await dbContext.Vulnerabilities
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
        var deleteCount = await dbContext.Vulnerabilities
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
        var vulnerability = await dbContext.Vulnerabilities.FindAsync(id);

        vulnerability.Remediation =
            await aiService.GenerateRemediationAsync(vulnerability.Summary);
        dbContext.Vulnerabilities.Update(vulnerability);
        await dbContext.SaveChangesAsync();

        var notification = new Notification
        {
            ToUserId = HttpContext.GetCurrentUser().Id,
            Title = "Job completed",
            Content =
                "The vulnerability remediation instructions have now been generated",
            Status = "unread"
        };
        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();

        var redis = redisConnections.GetDatabase();
        await redis.ListLeftPushAsync("notifications:queue",
            JsonSerializer.Serialize(new { type = "message" }));

        return Ok();
    }
}

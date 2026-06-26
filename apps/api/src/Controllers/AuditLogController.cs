using api_v2.Common;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

public class AuditLogDailySummary
{
    public DateTime LogDate { get; set; }
    public int Total { get; set; }
}

[Route("api/[controller]")]
[ApiController]
public class AuditLogController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery(Name = "page")] int p = 0)
    {
        var q = dbContext.AuditEntries.AsNoTracking()
            .Include(a => a.CreatedBy)
            .OrderByDescending(a => a.CreatedAt);

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

    [HttpGet]
    [Route("stats")]
    public async Task<IActionResult> GetStats()
    {
        var results = await dbContext.AuditEntries
            .AsNoTracking()
            .GroupBy(x => x.CreatedAt.Value.Date)
            .Select(g => new AuditLogDailySummary
            {
                LogDate = g.Key,
                Total = g.Count()
            })
            .OrderBy(x => x.LogDate)
            .ToListAsync();

        return Ok(results);
    }
}

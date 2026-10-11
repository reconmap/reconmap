using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/vulnerabilities/categories")]
[ApiController]
public class VulnerabilitiesCategoriesController(
    AppDbContext dbContext,
    ILogger<VulnerabilitiesCategoriesController> logger)
    : AppController(dbContext)
{
    private readonly ILogger _logger = logger;

    [HttpPost]
    public async Task<IActionResult> Create(VulnerabilityCategory requestModel)
    {
        dbContext.VulnerabilityCategories.Add(requestModel);

        AuditAction(AuditActions.Created, "Vulnerability Category", new { id = requestModel.Id });
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMany), new { id = requestModel.Id }, requestModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit ?? 100, maxLimit);

        var q = dbContext.VulnerabilityCategories.AsNoTracking()
            .OrderByDescending(a => a.CreatedAt);

        var page = await q.Take(take).ToListAsync();
        return Ok(page);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Vulnerability Category")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await dbContext.VulnerabilityCategories
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

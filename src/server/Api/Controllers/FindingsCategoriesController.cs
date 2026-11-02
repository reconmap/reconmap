using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Controllers;

[Route("api/findings/categories")]
[ApiController]
public class FindingsCategoriesController(
    AppDbContext dbContext,
    ILogger<FindingsCategoriesController> logger)
    : AppController(dbContext)
{
    private readonly ILogger _logger = logger;

    [HttpPost]
    public async Task<IActionResult> Create(FindingCategory requestModel)
    {
        dbContext.FindingCategories.Add(requestModel);

        AuditAction(AuditActions.Created, "Finding Category", new { id = requestModel.Id });
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMany), new { id = requestModel.Id }, requestModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit ?? 100, maxLimit);

        var q = dbContext.FindingCategories.AsNoTracking()
            .OrderByDescending(a => a.CreatedAt);

        var page = await q.Take(take).ToListAsync();
        return Ok(page);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Finding Category")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await dbContext.FindingCategories
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

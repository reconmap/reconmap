using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AssetsController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOne(Asset asset)
    {
        dbContext.Assets.Add(asset);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = asset.Id }, asset);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int projectId)
    {
        var q = dbContext.Assets.AsNoTracking()
            .Where(a => a.ProjectId == projectId)
            .OrderByDescending(a => a.CreatedAt);

        var assets = await q.ToListAsync();
        return Ok(assets);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var asset = await dbContext.Assets.FindAsync(id);
        if (asset == null) return NotFound();

        return Ok(asset);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Asset")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await dbContext.Assets
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

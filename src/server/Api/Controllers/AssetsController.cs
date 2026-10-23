using Reconmap.Api.Common;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AssetsController(AppDbContext dbContext, IAiService aiService) : ControllerBase
{
    public sealed class EnsureAssetRequest
    {
        public int ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public int? ParentId { get; set; }
        public string? Tags { get; set; }
    }

    [HttpPost]
    [Audit(AuditActions.Created, "Asset")]
    public async Task<IActionResult> CreateOne(Asset asset)
    {
        dbContext.Assets.Add(asset);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id = asset.Id };

        return CreatedAtAction(nameof(GetOne), new { id = asset.Id }, asset);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int projectId)
    {
        var q = dbContext.Assets.AsNoTracking()
            .Where(a => a.ProjectId == projectId)
            .OrderByDescending(a => a.CreatedAt);

        if (!HttpContext.Request.Query.ContainsKey("limit"))
        {
            return Ok(await q.ToListAsync());
        }

        var totalCount = await q.CountAsync();
        var pagination = new PaginationRequestHandler(HttpContext.Request.Query, totalCount);

        var assets = await q
            .Skip(pagination.CalculateOffset())
            .Take(pagination.GetResultsPerPage())
            .ToListAsync();

        Response.Headers["X-Total-Count"] = totalCount.ToString();
        Response.Headers["X-Page-Count"] = pagination.CalculatePageCount().ToString();
        return Ok(assets);
    }

    [HttpPost("ensure")]
    public async Task<IActionResult> EnsureOne([FromBody] EnsureAssetRequest request)
    {
        var name = request.Name?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest("Missing asset name");
        }

        var assetType = request.Type?.Trim();
        var existingAsset = await dbContext.Assets.AsNoTracking()
            .FirstOrDefaultAsync(a => a.ProjectId == request.ProjectId && a.Name == name && a.Type == assetType);

        if (existingAsset != null)
        {
            return Ok(existingAsset);
        }

        var asset = new Asset
        {
            ProjectId = request.ProjectId,
            Name = name,
            Type = assetType,
            ParentId = request.ParentId,
            Tags = request.Tags
        };

        dbContext.Assets.Add(asset);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = asset.Id }, asset);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(int id)
    {
        var asset = await dbContext.Assets.FindAsync(id);
        if (asset == null) return NotFound();

        return Ok(asset);
    }

    [HttpPost("{id:int}/enrich")]
    public async Task<IActionResult> Enrich(int id)
    {
        var asset = await dbContext.Assets.FindAsync(id);
        if (asset == null) return NotFound();

        var recommendation = await aiService.EnrichAssetAsync(
            asset.Name, asset.Type, asset.ProjectId, HttpContext.GetCurrentUser()?.Id);

        return Ok(new { recommendation });
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

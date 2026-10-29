using Reconmap.Api.Application.Services;
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
public class AssetsController(AppDbContext dbContext, IAiService aiService, IAssetUpsertService assetUpsertService) : ControllerBase
{
    public sealed class EnsureAssetRequest
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public Guid? ParentId { get; set; }
        public string? Attributes { get; set; }
        public string? Tags { get; set; }
    }

    public sealed class UpdateAssetRequest
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
        public Guid? ParentId { get; set; }
        public string? Attributes { get; set; }
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
    public async Task<IActionResult> GetMany([FromQuery] Guid projectId, [FromQuery] Guid? parentId = null,
        [FromQuery] bool rootsOnly = false, [FromQuery] string? type = null)
    {
        var filtered = dbContext.Assets.AsNoTracking()
            .Where(a => a.ProjectId == projectId);

        if (parentId.HasValue)
            filtered = filtered.Where(a => a.ParentId == parentId);
        else if (rootsOnly)
            filtered = filtered.Where(a => a.ParentId == null);

        if (!string.IsNullOrWhiteSpace(type))
            filtered = filtered.Where(a => a.Type == type.Trim().ToLower());

        var q = filtered.OrderByDescending(a => a.CreatedAt);

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

        var (asset, created) = await assetUpsertService.UpsertAsync(request.ProjectId, request.ParentId,
            new Asset { Name = name, Type = request.Type, Attributes = request.Attributes, Tags = request.Tags }, null);

        return created ? CreatedAtAction(nameof(GetOne), new { id = asset.Id }, asset) : Ok(asset);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var asset = await dbContext.Assets.FindAsync(id);
        if (asset == null) return NotFound();

        return Ok(asset);
    }

    [HttpPut("{id:guid}")]
    [Audit(AuditActions.Updated, "Asset")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateOne(Guid id, [FromBody] UpdateAssetRequest request)
    {
        var asset = await dbContext.Assets.FindAsync(id);
        if (asset == null) return NotFound();

        if (request.ParentId.HasValue && !await CanReparentAsync(asset, request.ParentId.Value))
            return BadRequest("Invalid parent");

        if (request.Name != null)
        {
            var name = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Missing asset name");
            asset.Name = name;
        }

        asset.Type = string.IsNullOrWhiteSpace(request.Type) ? null : request.Type.Trim().ToLowerInvariant();
        asset.ParentId = request.ParentId;
        asset.Attributes = request.Attributes;
        asset.Tags = request.Tags;

        try
        {
            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("An asset with that name already exists under the same parent");
        }

        HttpContext.Items["AuditData"] = new { id };

        return Ok(asset);
    }

    /// <summary>A node can move to another node of its project, but never under itself or its own descendants.</summary>
    private async Task<bool> CanReparentAsync(Asset asset, Guid newParentId)
    {
        Guid? cursor = newParentId;
        while (cursor.HasValue)
        {
            if (cursor.Value == asset.Id) return false;

            var parent = await dbContext.Assets.AsNoTracking()
                .Where(a => a.Id == cursor.Value)
                .Select(a => new { a.ProjectId, a.ParentId })
                .FirstOrDefaultAsync();
            if (parent == null || parent.ProjectId != asset.ProjectId) return false;

            cursor = parent.ParentId;
        }

        return true;
    }

    [HttpPost("{id:guid}/enrich")]
    public async Task<IActionResult> Enrich(Guid id)
    {
        var asset = await dbContext.Assets.FindAsync(id);
        if (asset == null) return NotFound();

        var recommendation = await aiService.EnrichAssetAsync(
            asset.Name, asset.Type ?? string.Empty, asset.ProjectId, HttpContext.GetCurrentUser()?.Id);

        return Ok(new { recommendation });
    }

    [HttpDelete("{id:guid}")]
    [Audit(AuditActions.Deleted, "Asset")]
    public async Task<IActionResult> DeleteOne(Guid id)
    {
        var deleteCount = await dbContext.Assets
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

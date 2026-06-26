using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrganisationsController(AppDbContext dbContext, ILogger<OrganisationsController> logger)
    : AppController(dbContext)
{
    [HttpPost]
    public async Task<IActionResult> CreateOne([FromForm] Organisation entity)
    {
        entity.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Organisations.Add(entity);

        AuditAction(AuditActions.Created, "Organisation", new { id = entity.Id });
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = entity.Id }, entity);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, Organisation requestModel)
    {
        var dbModel = await dbContext.Organisations.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).State = EntityState.Modified;
        dbModel.Name = requestModel.Name;
        dbModel.Address = requestModel.Address;
        dbModel.Kind = requestModel.Kind;
        dbModel.Url = requestModel.Url;
        await dbContext.SaveChangesAsync();

        return Ok(dbModel);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit, [FromQuery] string? kind)
    {
        var q = dbContext.Organisations.AsNoTracking();
        if (kind != null)
            q = q.Where(n => n.Kind == kind);
        q = q.OrderByDescending(a => a.CreatedAt);

        var organisations = await q.ToListAsync();
        return Ok(organisations);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var org = await dbContext.Organisations
            .Include(o => o.CreatedBy)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (org == null) return NotFound();

        return Ok(org);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Organisation")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await dbContext.Organisations
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

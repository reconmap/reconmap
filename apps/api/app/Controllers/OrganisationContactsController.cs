using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/organisations/{organisationId:int}/contacts")]
[ApiController]
public class OrganisationContactsController(AppDbContext dbContext, ILogger<OrganisationsController> logger)
    : AppController(dbContext)
{
    [HttpPost]
    public async Task<IActionResult> CreateOne(uint organisationId, Contact entity)
    {
        entity.OrganisationId = organisationId;

        dbContext.Contacts.Add(entity);

        AuditAction(AuditActions.Created, "Contact", new { id = entity.Id });
        await dbContext.SaveChangesAsync();

        return Created();
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMany(uint organisationId)
    {
        var q = dbContext.Contacts.AsNoTracking()
            .Where(n => n.OrganisationId == organisationId)
            .OrderByDescending(a => a.Name);

        var contacts = await q.ToListAsync();

        return Ok(contacts);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Organisation Contact")]
    public async Task<IActionResult> DeleteOne(uint organisationId, int id)
    {
        var deleteCount = await dbContext.Contacts
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

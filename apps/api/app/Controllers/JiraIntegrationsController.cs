using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/integrations/jira")]
[ApiController]
public class JiraIntegrationsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var integrations = await dbContext.JiraIntegrations.ToListAsync();
        return Ok(integrations);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOne(uint id)
    {
        var integration = await dbContext.JiraIntegrations.FindAsync(id);
        if (integration == null) return NotFound();
        return Ok(integration);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] JiraIntegration integration)
    {
        dbContext.JiraIntegrations.Add(integration);
        await dbContext.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = integration.Id }, integration);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, [FromBody] JiraIntegration integration)
    {
        var dbModel = await dbContext.JiraIntegrations.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(integration);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await dbContext.SaveChangesAsync();
        return Ok(dbModel);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var deleteCount = await dbContext.JiraIntegrations
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();
        return NoContent();
    }
}

using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/integrations/azure-devops")]
[ApiController]
public class AzureDevopsIntegrationsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var integrations = await dbContext.AzureDevopsIntegrations.ToListAsync();
        return Ok(integrations);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOne(uint id)
    {
        var integration = await dbContext.AzureDevopsIntegrations.FindAsync(id);
        if (integration == null) return NotFound();
        return Ok(integration);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] AzureDevopsIntegration integration)
    {
        dbContext.AzureDevopsIntegrations.Add(integration);
        await dbContext.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = integration.Id }, integration);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, [FromBody] AzureDevopsIntegration integration)
    {
        var dbModel = await dbContext.AzureDevopsIntegrations.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(integration);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await dbContext.SaveChangesAsync();
        return Ok(dbModel);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var deleteCount = await dbContext.AzureDevopsIntegrations
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();
        return NoContent();
    }
}

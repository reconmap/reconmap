using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize("AdminOnly")]
public class WebhooksController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var webhooks = await dbContext.Webhooks
            .AsNoTracking()
            .ToListAsync();
        return Ok(webhooks);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOne(uint id)
    {
        var webhook = await dbContext.Webhooks.FindAsync(id);
        if (webhook == null) return NotFound();
        return Ok(webhook);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] Webhook webhook)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        dbContext.Webhooks.Add(webhook);
        await dbContext.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = webhook.Id }, webhook);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateOne(uint id, [FromBody] Webhook webhook)
    {
        var dbModel = await dbContext.Webhooks.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(webhook);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await dbContext.SaveChangesAsync();
        return Ok(dbModel);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var deleteCount = await dbContext.Webhooks
            .Where(w => w.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        return NoContent();
    }
}

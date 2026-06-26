using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SecretsController(AppDbContext dbContext, ISecretsService secretsService)
    : AppController(dbContext)
{
    [HttpPost]
    public async Task<IActionResult> CreateOne(JsonElement json)
    {
        var password = json.GetProperty("password").GetString()!;
        var value = json.GetProperty("value").GetString()!;
        var name = json.GetProperty("name").GetString()!;
        var type = json.GetProperty("type").GetString()!;
        var note = json.TryGetProperty("note", out var noteElement) ? noteElement.GetString() : null;
        uint? projectId = json.TryGetProperty("projectId", out var projectIdElement) &&
                          projectIdElement.ValueKind == JsonValueKind.Number
            ? projectIdElement.GetUInt32()
            : null;

        var secret = await secretsService.CreateAsync(HttpContext.GetCurrentUser().Id, password, name, type, value, note,
            projectId);

        return CreatedAtAction(nameof(GetSecret), new { id = secret.Id }, secret);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSecret(uint id)
    {
        var secret = await secretsService.GetByIdAsync(id);
        if (secret == null) return NotFound();

        return Ok(secret);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit)
    {
        var page = await secretsService.GetManyAsync(limit ?? 100);
        return Ok(page);
    }

    [HttpPost("{id:int}/decrypt")]
    public async Task<IActionResult> GetOne(uint id, JsonElement json)
    {
        var password = json.GetProperty("password").GetString()!;
        var result = await secretsService.DecryptAsync(id, password);

        if (result == null) return Forbid();

        var (secret, value) = result.Value;
        return Ok(new
        {
            secret.Name,
            secret.Note,
            secret.Type,
            value
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PatchOne(uint id, JsonElement json)
    {
        var password = json.GetProperty("password").GetString()!;
        var value = json.GetProperty("value").GetString()!;
        var name = json.GetProperty("name").GetString()!;
        var type = json.GetProperty("type").GetString()!;
        var note = json.TryGetProperty("note", out var noteElement) ? noteElement.GetString() : null;
        uint? projectId = json.TryGetProperty("projectId", out var projectIdElement) &&
                          projectIdElement.ValueKind == JsonValueKind.Number
            ? projectIdElement.GetUInt32()
            : null;

        var success = await secretsService.UpdateAsync(id, password, name, type, value, note, projectId);
        if (!success) return Forbid();

        return Accepted();
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Secret")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var success = await secretsService.DeleteAsync(id);
        if (!success) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

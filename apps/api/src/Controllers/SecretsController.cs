using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Infrastructure.Persistence;
using api_v2.Infrastructure.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SecretsController(AppDbContext dbContext, ISecretsService secretsService, IRequestAccessScope accessScope)
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
        int? projectId = json.TryGetProperty("projectId", out var projectIdElement) &&
                          projectIdElement.ValueKind == JsonValueKind.Number
            ? projectIdElement.GetInt32()
            : null;

        if (projectId.HasValue && !await accessScope.CanAccessProjectAsync(projectId))
            return Forbid();

        var secret = await secretsService.CreateAsync(HttpContext.GetCurrentUser().Id, password, name, type, value, note,
            projectId);

        return CreatedAtAction(nameof(GetSecret), new { id = secret.Id }, secret);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSecret(int id)
    {
        var secret = await secretsService.GetByIdAsync(id);
        if (secret == null) return NotFound();
        if (!await accessScope.CanAccessSecretAsync(secret)) return NotFound();

        return Ok(secret);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? limit)
    {
        if (!accessScope.CanAccessVault) return NotFound();
        var memberProjectIds = await accessScope.MemberProjectIdsAsync();
        var take = Math.Min(limit ?? 100, 500);
        var page = await dbContext.Secrets.AsNoTracking()
            .Where(s => accessScope.IsPrivileged ||
                (s.OwnerUid == accessScope.UserId ||
                 (s.ProjectId.HasValue && memberProjectIds.Contains(s.ProjectId.Value))))
            .OrderByDescending(s => s.CreatedAt).Take(take).ToListAsync();
        return Ok(page);
    }

    [HttpPost("{id:int}/decrypt")]
    public async Task<IActionResult> GetOne(int id, JsonElement json)
    {
        var secret = await secretsService.GetByIdAsync(id);
        if (secret == null || !await accessScope.CanAccessSecretAsync(secret)) return NotFound();
        var password = json.GetProperty("password").GetString()!;
        var result = await secretsService.DecryptAsync(id, password);

        if (result == null) return Forbid();

        var (decryptedSecret, value) = result.Value;
        return Ok(new
        {
            decryptedSecret.Name,
            decryptedSecret.Note,
            decryptedSecret.Type,
            value
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PatchOne(int id, JsonElement json)
    {
        var existing = await secretsService.GetByIdAsync(id);
        if (existing == null || !await accessScope.CanAccessSecretAsync(existing)) return NotFound();
        var password = json.GetProperty("password").GetString()!;
        var value = json.GetProperty("value").GetString()!;
        var name = json.GetProperty("name").GetString()!;
        var type = json.GetProperty("type").GetString()!;
        var note = json.TryGetProperty("note", out var noteElement) ? noteElement.GetString() : null;
        int? projectId = json.TryGetProperty("projectId", out var projectIdElement) &&
                          projectIdElement.ValueKind == JsonValueKind.Number
            ? projectIdElement.GetInt32()
            : null;
        if (projectId.HasValue && !await accessScope.CanAccessProjectAsync(projectId)) return Forbid();

        var success = await secretsService.UpdateAsync(id, password, name, type, value, note, projectId);
        if (!success) return Forbid();

        return Accepted();
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Secret")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var secret = await secretsService.GetByIdAsync(id);
        if (secret == null || !await accessScope.CanAccessSecretAsync(secret)) return NotFound();
        var success = await secretsService.DeleteAsync(id);
        if (!success) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

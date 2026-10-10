using System.Text.Json;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Keycloak;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController(AppDbContext dbContext, IKeycloakUserDirectory directory)
    : AppController(dbContext)
{
    [HttpPost]
    public async Task<IActionResult> CreatOne(User user)
    {
        var subjectId = await directory.CreateAsync(new KeycloakUserInput(
            user.Username,
            user.Email,
            user.FirstName,
            user.LastName,
            GetKeycloakGroupName(user.Role),
            user.Locale,
            user.TimeZone));

        user.SubjectId = subjectId;

        try
        {
            dbContext.Users.Add(user);

            AuditAction(AuditActions.Created, "User", new { id = user.Id });
            await dbContext.SaveChangesAsync();
        }
        catch
        {
            // Keep Keycloak and the user table in step: do not leave an orphaned Keycloak user behind.
            await directory.DeleteAsync(subjectId);
            throw;
        }

        return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
    }

    internal static string GetKeycloakGroupName(UserRole role) =>
        $"{role.ToString().ToLowerInvariant()}-group";

    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var users = await dbContext.Users.ToListAsync();
        await Task.WhenAll(users.Select(ApplyLoginInfoAsync));

        return Ok(users);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id)
    {
        var existing = await dbContext.Users.FindAsync(id);
        if (existing == null) return NotFound();

        await ApplyLoginInfoAsync(existing);

        return Ok(existing);
    }

    [HttpGet("{id:int}/activity")]
    public async Task<IActionResult> GetActivity(int id, [FromQuery] int? limit)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit ?? 100, maxLimit);

        var q = dbContext.AuditEntries.AsNoTracking()
            .Where(e => e.CreatedByUid == id)
            .OrderByDescending(a => a.CreatedAt);

        var page = await q.Take(take).ToListAsync();
        return Ok(page);
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "User")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var user = await dbContext.Users.FindAsync(id);
        if (user == null) return NotFound();

        if (user.SubjectId != KeycloakUserDirectory.SystemSubjectId)
        {
            await directory.DeleteAsync(user.SubjectId);
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchOne(int id, [FromBody] JsonElement body)
    {
        if (body.TryGetProperty("mfaEnabled", out _))
            return BadRequest("MFA is managed in Keycloak and cannot be changed from Reconmap.");

        var user = await dbContext.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        // Language, timezone and preferences (theme) are personal: only the owner of the profile can change them, administrators included.
        var isOwner = HttpContext.GetCurrentUser()?.Id == user.Id;
        if (!isOwner && (body.TryGetProperty("locale", out _) || body.TryGetProperty("timezone", out _) || body.TryGetProperty("preferences", out _)))
            return Forbid();

        // Identity fields live in Keycloak.
        var identityUpdate = new KeycloakUserUpdate(
            Username: ReadString(body, "username"),
            Email: ReadString(body, "email"),
            FirstName: ReadString(body, "firstName"),
            LastName: ReadString(body, "lastName"),
            Enabled: ReadBool(body, "active"),
            Locale: ReadString(body, "locale"),
            TimeZone: ReadString(body, "timezone"));

        if (HasAnyValue(identityUpdate))
        {
            await directory.UpdateAsync(user.SubjectId, identityUpdate);
        }

        // Role is authorisation data: stored in Reconmap and mirrored as a Keycloak group.
        if (body.TryGetProperty("role", out var roleProperty) &&
            Enum.TryParse<UserRole>(roleProperty.GetString(), ignoreCase: true, out var role) &&
            role != user.Role)
        {
            await directory.SetRoleGroupAsync(user.SubjectId, RoleGroupFor(role));
            user.Role = role;
        }

        // Application data lives in Reconmap.
        if (body.TryGetProperty("shortBio", out var shortBio))
        {
            user.ShortBio = shortBio.ValueKind == JsonValueKind.Null ? null : shortBio.GetString();
        }

        if (body.TryGetProperty("preferences", out var prefs))
        {
            // Store the entire preferences object as JSON text
            user.Preferences = prefs.GetRawText();
        }

        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/actions")]
    public async Task<IActionResult> ExecuteAction(int id, [FromBody] UserActionRequest request)
    {
        var user = await dbContext.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        switch (request.Name)
        {
            case "enable-mfa":
                // Keycloak creates the OTP credential when the user completes this required action at next login.
                await directory.AddRequiredActionAsync(user.SubjectId, KeycloakRequiredActions.ConfigureTotp);
                return NoContent();
            default:
                return BadRequest($"Unsupported user action '{request.Name}'.");
        }
    }

    public sealed record UserActionRequest(string? Name);

    private static class KeycloakRequiredActions
    {
        public const string ConfigureTotp = "CONFIGURE_TOTP";
    }

    private async Task ApplyLoginInfoAsync(User user)
    {
        if (user.SubjectId == KeycloakUserDirectory.SystemSubjectId) return;

        var info = await directory.GetLoginInfoAsync(user.SubjectId);
        user.MfaEnabled = info.MfaEnabled;
        user.LastLoginAt = info.LastLoginAt;
    }

    private static string GetKeycloakGroupName(UserRole role) => $"{role.ToString().ToLower()}-group";

    private static string? ReadString(JsonElement body, string name)
        => body.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString() : null;

    private static bool? ReadBool(JsonElement body, string name)
        => body.TryGetProperty(name, out var value) && (value.ValueKind is JsonValueKind.True or JsonValueKind.False)
            ? value.GetBoolean()
            : null;

    private static bool HasAnyValue(KeycloakUserUpdate update)
        => update.Username != null || update.Email != null || update.FirstName != null ||
           update.LastName != null || update.Enabled != null || update.Locale != null || update.TimeZone != null;
}

using System.Text.Json;
using api_v2.Domain.AuditActions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Authentication;
using api_v2.Infrastructure.Persistence;
using FS.Keycloak.RestApiClient.Api;
using FS.Keycloak.RestApiClient.Authentication.ClientFactory;
using FS.Keycloak.RestApiClient.Authentication.Flow;
using FS.Keycloak.RestApiClient.ClientFactory;
using FS.Keycloak.RestApiClient.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController(AppDbContext dbContext, IOptions<KeycloakOptions> keycloakOptions)
    : AppController(dbContext)
{
    [HttpPost]
    public async Task<IActionResult> CreatOne(User user)
    {
        var creds = new ClientCredentialsFlow
        {
            ClientId = keycloakOptions.Value.ClientId,
            ClientSecret = keycloakOptions.Value.ClientSecret,
            KeycloakUrl = keycloakOptions.Value.KeycloakUrl,
            Realm = keycloakOptions.Value.Realm
        };

        using var httpClient = AuthenticationHttpClientFactory.Create(creds);
        using var usersApi = ApiClientFactory.Create<UsersApi>(httpClient);
        await usersApi.PostUsersAsync(creds.Realm, new UserRepresentation
        {
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Enabled = true,
            Username = user.Username,
            RequiredActions = ["UPDATE_PASSWORD"],
            Groups = [$"{user.Role}-group"]
        });

        var createdUser = await usersApi
            .GetUsersAsync(creds.Realm, username: user.Username, exact: true);

        user.SubjectId = createdUser[0].Id;

        dbContext.Users.Add(user);

        AuditAction(AuditActions.Created, "User", new { id = user.Id });
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
    }

    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        return Ok(await dbContext.Users.ToListAsync());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(uint id)
    {
        var existing = await dbContext.Users.FindAsync(id);
        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpGet("{id:int}/activity")]
    public async Task<IActionResult> GetActivity(uint id, [FromQuery] int? limit)
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
        var deleteCount = await dbContext.Users
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchOne(uint id, [FromBody] JsonElement body)
    {
        if (!body.TryGetProperty("preferences", out var prefs))
            return BadRequest("Missing 'preferences' property in request body.");

        var user = await dbContext.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        // Store the entire preferences object as JSON text
        user.Preferences = prefs.GetRawText();

        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}

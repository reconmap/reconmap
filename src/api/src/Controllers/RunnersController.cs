using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Authentication;
using Reconmap.Api.Infrastructure.Persistence;
using FS.Keycloak.RestApiClient.Api;
using FS.Keycloak.RestApiClient.Authentication.ClientFactory;
using FS.Keycloak.RestApiClient.Authentication.Flow;
using FS.Keycloak.RestApiClient.ClientFactory;
using FS.Keycloak.RestApiClient.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RunnersController(AppDbContext dbContext, IOptions<KeycloakOptions> keycloakOptions)
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] Runner runner)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        runner.ClientId = Guid.NewGuid().ToString();
        //runner.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Runners.Add(runner);
        await dbContext.SaveChangesAsync();

        var creds = new ClientCredentialsFlow()
        {
            ClientId = keycloakOptions.Value.ClientId,
            ClientSecret = keycloakOptions.Value.ClientSecret,
            KeycloakUrl = keycloakOptions.Value.KeycloakUrl,
            Realm = keycloakOptions.Value.Realm
        };

        using var httpClient = AuthenticationHttpClientFactory.Create(creds);
        using var clientsApi = ApiClientFactory.Create<ClientsApi>(httpClient);

       await clientsApi.PostClientsAsync(keycloakOptions.Value.Realm, new ClientRepresentation()
        {
            ClientId = runner.ClientId,
            Name =  $"Runner: {runner.Hostname}",
            Enabled = true,
            PublicClient = false,
            ServiceAccountsEnabled =  true,
            StandardFlowEnabled        = false,
            AuthorizationServicesEnabled = true,
            ClientAuthenticatorType = "client-secret"

        });
        var createdClients = await clientsApi.GetClientsAsync(keycloakOptions.Value.Realm, runner.ClientId);
        var createdClient = createdClients.First();
        var clientId = createdClient.Id;

        var secret = clientsApi.GetClientsClientSecretByClientUuid(keycloakOptions.Value.Realm, createdClient.Id);

        return CreatedAtAction(nameof(GetOne), new { id = runner.Id }, new {
            ClientId = runner.ClientId,
            ClientSecret = secret.Value
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var q = dbContext.Runners.AsNoTracking()
            .OrderByDescending(a => a.LastPingAt);

        var runners = await q.ToListAsync();
        return Ok(runners);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(int id)
    {
        var runner = await dbContext.Runners.FindAsync(id);
        if (runner == null) return NotFound();

        return Ok(runner);
    }

    [HttpPatch("{clientId:guid}/ping")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PatchRunner(Guid clientId)
    {
        var runner = await dbContext.Runners.Where(a => a.ClientId == clientId.ToString()).FirstOrDefaultAsync();
        if (runner == null) return NotFound();

        runner.LastPingAt = DateTime.UtcNow;
        dbContext.Update(runner);
        await dbContext.SaveChangesAsync();

        return Accepted();
    }

    [HttpPatch("{clientId:guid}/boot")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BootRunner(Guid clientId, [FromBody] Dictionary<string, object> body)
    {
        var runner = await dbContext.Runners.Where(a => a.ClientId == clientId.ToString()).FirstOrDefaultAsync();
        if (runner == null) return NotFound();

        runner.LastBootAt = DateTime.UtcNow;
        runner.LastPingAt = DateTime.UtcNow;
        runner.Version = body["version"]?.ToString();
        runner.Hostname = body["hostname"]?.ToString();
        runner.Arch = body["arch"]?.ToString();
        runner.Cpu = body["cpu"]?.ToString();
        runner.Memory = body["memory"]?.ToString();
        runner.Os = body["os"]?.ToString();
        runner.Ip = body["ip"]?.ToString();
        runner.ListenAddr = body["listen_addr"]?.ToString();

        dbContext.Update(runner);
        await dbContext.SaveChangesAsync();

        return Accepted();
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Runner")]
    public async Task<IActionResult> DeleteOne(int id)
    {
        var deleteCount = await dbContext.Runners
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

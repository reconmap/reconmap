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
public class AgentsController(AppDbContext dbContext, ILogger<AgentsController> logger, IOptions<KeycloakOptions> keycloakOptions)
    : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] Agent agent)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        agent.ClientId = Guid.NewGuid().ToString();
        //agent.CreatedByUid = HttpContext.GetCurrentUser()!.Id;
        dbContext.Agents.Add(agent);
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
            ClientId = agent.ClientId,
            Name =  $"Agent: {agent.Hostname}",
            Enabled = true,
            PublicClient = false,
            ServiceAccountsEnabled =  true,
            StandardFlowEnabled        = false,
            AuthorizationServicesEnabled = true,
            ClientAuthenticatorType = "client-secret"

        });
        var createdClients = await clientsApi.GetClientsAsync(keycloakOptions.Value.Realm, agent.ClientId);
        var createdClient = createdClients.First();
        var clientId = createdClient.Id;

        var secret = clientsApi.GetClientsClientSecretByClientUuid(keycloakOptions.Value.Realm, createdClient.Id);

        return CreatedAtAction(nameof(GetOne), new { id = agent.Id }, new {
            ClientId = agent.ClientId,
            ClientSecret = secret.Value
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetMany()
    {
        var q = dbContext.Agents.AsNoTracking()
            .OrderByDescending(a => a.LastPingAt);

        var agents = await q.ToListAsync();
        return Ok(agents);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(uint id)
    {
        var agent = await dbContext.Agents.FindAsync(id);
        if (agent == null) return NotFound();

        return Ok(agent);
    }

    [HttpPatch("{clientId:guid}/ping")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PatchAgent(Guid clientId)
    {
        var agent = await dbContext.Agents.Where(a => a.ClientId == clientId.ToString()).FirstOrDefaultAsync();
        if (agent == null) return NotFound();

        agent.LastPingAt = DateTime.UtcNow;
        dbContext.Update(agent);
        await dbContext.SaveChangesAsync();

        return Accepted();
    }

    [HttpPatch("{clientId:guid}/boot")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BootAgent(Guid clientId, [FromBody] Dictionary<string, object> body)
    {
        var agent = await dbContext.Agents.Where(a => a.ClientId == clientId.ToString()).FirstOrDefaultAsync();
        if (agent == null) return NotFound();

        agent.LastBootAt = DateTime.UtcNow;
        agent.LastPingAt = DateTime.UtcNow;
        agent.Version = body["version"]?.ToString();
        agent.Hostname = body["hostname"]?.ToString();
        agent.Arch = body["arch"]?.ToString();
        agent.Cpu = body["cpu"]?.ToString();
        agent.Memory = body["memory"]?.ToString();
        agent.Os = body["os"]?.ToString();
        agent.Ip = body["ip"]?.ToString();
        agent.ListenAddr = body["listen_addr"]?.ToString();

        dbContext.Update(agent);
        await dbContext.SaveChangesAsync();

        return Accepted();
    }

    [HttpDelete("{id:int}")]
    [Audit(AuditActions.Deleted, "Agent")]
    public async Task<IActionResult> DeleteOne(uint id)
    {
        var deleteCount = await dbContext.Agents
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }
}

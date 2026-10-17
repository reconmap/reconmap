using System.Text.Json;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Resources;

/// <summary>
/// MCP resources for runners. Every read is scoped to what the authenticated user may access.
/// </summary>
public class RunnerResources(IRunnerService runnerService, McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerResource(UriTemplate = "reconmap://runners", Name = "Reconmap Runners", MimeType = "application/json")]
    public async Task<string> GetRunners()
    {
        // Runners are infrastructure, not project data: administrators and superusers only (same as the OPA policy).
        guard.RequirePrivileged();

        var runners = (await runnerService.GetManyAsync())
            .Select(a => new { a.Id, a.Name, a.Ip, a.Active });
        return JsonSerializer.Serialize(runners, JsonOptions);
    }
}

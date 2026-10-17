using System.Text.Json;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Resources;

/// <summary>
/// MCP resources for tasks. Every read is scoped to what the authenticated user may access.
/// </summary>
public class TaskResources(ITaskService taskService, McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerResource(UriTemplate = "reconmap://tasks", Name = "Reconmap Tasks", MimeType = "application/json")]
    public async Task<string> GetTasks()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var tasks = (await taskService.GetManyAsync(new TaskFilter(VisibleProjectIds: visibleIds)))
            .Select(t => new { t.Id, t.ProjectId, t.Summary, t.Priority, t.Status });
        return JsonSerializer.Serialize(tasks, JsonOptions);
    }
}

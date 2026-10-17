using System.ComponentModel;
using System.Text.Json;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Tools;

/// <summary>
/// Reconmap MCP tools. Every call is scoped to what the authenticated user may access.
/// </summary>
public class ReconmapTools(IProjectService projectService, McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerTool(ReadOnly = true)]
    [Description("Gets a list of the Reconmap projects the current user can access.")]
    public async Task<string> ListProjects()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var page = await projectService.GetManyAsync(new ProjectFilter(VisibleProjectIds: visibleIds), Paging.Unbounded);

        var projects = page.Data.Select(p => new { p.Id, p.Name, p.Visibility, p.Archived });
        return JsonSerializer.Serialize(projects, JsonOptions);
    }

    [McpServerTool(ReadOnly = true)]
    [Description("Gets details about a specific project by its ID.")]
    public async Task<string> GetProjectDetails(
        [Description("The ID of the project to retrieve.")] int projectId)
    {
        await guard.RequireReadAsync("projects", projectId, projectId);

        var p = await projectService.GetByIdAsync(projectId);
        if (p == null)
            throw new McpException("Project not found.");

        return JsonSerializer.Serialize(new { p.Id, p.Name, p.Description, p.Visibility, p.Archived }, JsonOptions);
    }
}

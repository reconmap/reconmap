using System.ComponentModel;
using System.Text.Json;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Resources;

/// <summary>
/// MCP resources for projects. Every read is scoped to what the authenticated user may access.
/// </summary>
public class ProjectResources(IProjectService projectService, McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerResource(UriTemplate = "reconmap://projects", Name = "Reconmap Projects", MimeType = "application/json")]
    public async Task<string> GetProjects()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var page = await projectService.GetManyAsync(new ProjectFilter(VisibleProjectIds: visibleIds), Paging.Unbounded);

        var projects = page.Data.Select(p => new { p.Id, p.Name, p.Archived });
        return JsonSerializer.Serialize(projects, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://projects/{id}", Name = "Reconmap Project", MimeType = "application/json")]
    [Description("A single project by its ID.")]
    public async Task<string> GetProject(int id)
    {
        await guard.RequireReadAsync("projects", id, id);

        var p = await projectService.GetByIdAsync(id) ?? throw new McpException("Project not found.");

        return JsonSerializer.Serialize(new { p.Id, p.Name, p.Description, p.Archived }, JsonOptions);
    }
}

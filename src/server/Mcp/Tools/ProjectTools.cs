using System.ComponentModel;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Tools;

/// <summary>
/// Reconmap MCP tools for projects. Every call is scoped to what the authenticated user may access.
/// </summary>
public class ProjectTools(IProjectService projectService, McpAccessGuard guard)
{
    public record ProjectSummary(Guid Id, string Name, bool Archived);

    public record ProjectDetails(Guid Id, string Name, string? Description, bool Archived);

    [McpServerTool(ReadOnly = true, Destructive = false, Idempotent = true, OpenWorld = false, UseStructuredContent = true)]
    [Description("Gets a list of the Reconmap projects the current user can access.")]
    public async Task<IReadOnlyList<ProjectSummary>> ListProjects()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var page = await projectService.GetManyAsync(new ProjectFilter(VisibleProjectIds: visibleIds), Paging.Unbounded);

        return page.Data.Select(p => new ProjectSummary(p.Id, p.Name, p.Archived)).ToList();
    }

    [McpServerTool(ReadOnly = true, Destructive = false, Idempotent = true, OpenWorld = false, UseStructuredContent = true)]
    [Description("Gets details about a specific project by its ID.")]
    public async Task<ProjectDetails> GetProjectDetails(
        [Description("The ID of the project to retrieve.")] Guid projectId)
    {
        await guard.RequireReadAsync("projects", projectId, projectId);

        var p = await projectService.GetByIdAsync(projectId);
        if (p == null)
            throw new McpException("Project not found.");

        return new ProjectDetails(p.Id, p.Name, p.Description, p.Archived);
    }
}

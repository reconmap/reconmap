using System.ComponentModel;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Tools;

/// <summary>
/// Reconmap MCP tools. Every call is scoped to what the authenticated user may access.
/// </summary>
public class ReconmapTools(AppDbContext dbContext, McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerTool(ReadOnly = true)]
    [Description("Gets a list of the Reconmap projects the current user can access.")]
    public async Task<string> ListProjects()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var query = dbContext.Projects.AsNoTracking();
        if (visibleIds != null)
            query = query.Where(p => visibleIds.Contains(p.Id));

        var projects = await query
            .Select(p => new { p.Id, p.Name, p.Visibility, p.Archived })
            .ToListAsync();
        return JsonSerializer.Serialize(projects, JsonOptions);
    }

    [McpServerTool(ReadOnly = true)]
    [Description("Gets details about a specific project by its ID.")]
    public async Task<string> GetProjectDetails(
        [Description("The ID of the project to retrieve.")] int projectId)
    {
        await guard.RequireReadAsync("projects", projectId, projectId);

        var project = await dbContext.Projects
            .AsNoTracking()
            .Where(p => p.Id == projectId)
            .Select(p => new { p.Id, p.Name, p.Description, p.Visibility, p.Archived })
            .FirstOrDefaultAsync();

        if (project == null)
            throw new McpException("Project not found.");

        return JsonSerializer.Serialize(project, JsonOptions);
    }
}

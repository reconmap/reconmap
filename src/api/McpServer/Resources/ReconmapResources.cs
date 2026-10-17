using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol.Server;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Resources;

/// <summary>
/// Reconmap MCP resources for exposing entity data. Every read is scoped to what the authenticated user may access.
/// </summary>
public class ReconmapResources(AppDbContext dbContext, McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerResource(UriTemplate = "reconmap://projects", Name = "Reconmap Projects", MimeType = "application/json")]
    public async Task<string> GetProjects()
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

    [McpServerResource(UriTemplate = "reconmap://tasks", Name = "Reconmap Tasks", MimeType = "application/json")]
    public async Task<string> GetTasks()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var query = dbContext.Tasks.AsNoTracking();
        if (visibleIds != null)
            query = query.Where(t => visibleIds.Contains(t.ProjectId));

        var tasks = await query
            .Select(t => new { t.Id, t.ProjectId, t.Summary, t.Priority, t.Status })
            .ToListAsync();
        return JsonSerializer.Serialize(tasks, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://vulnerabilities", Name = "Reconmap Vulnerabilities", MimeType = "application/json")]
    public async Task<string> GetVulnerabilities()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var query = dbContext.Vulnerabilities.AsNoTracking();
        if (visibleIds != null)
            query = query.Where(v => v.ProjectId.HasValue && visibleIds.Contains(v.ProjectId.Value));

        var vulnerabilities = await query
            .Select(f => new { f.Id, f.ProjectId, f.Summary, f.Risk, f.Status })
            .ToListAsync();
        return JsonSerializer.Serialize(vulnerabilities, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://runners", Name = "Reconmap Runners", MimeType = "application/json")]
    public async Task<string> GetRunners()
    {
        // Runners are infrastructure, not project data: administrators and superusers only (same as the OPA policy).
        guard.RequirePrivileged();

        var runners = await dbContext.Runners
            .AsNoTracking()
            .Select(a => new { a.Id, a.Name, a.Ip, a.Active })
            .ToListAsync();
        return JsonSerializer.Serialize(runners, JsonOptions);
    }
}

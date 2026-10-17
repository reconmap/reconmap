using System.ComponentModel;
using System.Text.Json;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Resources;

/// <summary>
/// Reconmap MCP resources for exposing entity data. Every read is scoped to what the authenticated user may access.
/// </summary>
public class ReconmapResources(
    IProjectService projectService,
    ITaskService taskService,
    IVulnerabilityService vulnerabilityService,
    IRunnerService runnerService,
    McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerResource(UriTemplate = "reconmap://projects", Name = "Reconmap Projects", MimeType = "application/json")]
    public async Task<string> GetProjects()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var page = await projectService.GetManyAsync(new ProjectFilter(VisibleProjectIds: visibleIds), Paging.Unbounded);

        var projects = page.Data.Select(p => new { p.Id, p.Name, p.Visibility, p.Archived });
        return JsonSerializer.Serialize(projects, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://tasks", Name = "Reconmap Tasks", MimeType = "application/json")]
    public async Task<string> GetTasks()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var tasks = (await taskService.GetManyAsync(new TaskFilter(VisibleProjectIds: visibleIds)))
            .Select(t => new { t.Id, t.ProjectId, t.Summary, t.Priority, t.Status });
        return JsonSerializer.Serialize(tasks, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://vulnerabilities", Name = "Reconmap Vulnerabilities", MimeType = "application/json")]
    public async Task<string> GetVulnerabilities()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var page = await vulnerabilityService.GetManyAsync(new VulnerabilityFilter(VisibleProjectIds: visibleIds), Paging.Unbounded);

        var vulnerabilities = page.Data.Select(f => new { f.Id, f.ProjectId, f.Summary, f.Risk, f.Status });
        return JsonSerializer.Serialize(vulnerabilities, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://runners", Name = "Reconmap Runners", MimeType = "application/json")]
    public async Task<string> GetRunners()
    {
        // Runners are infrastructure, not project data: administrators and superusers only (same as the OPA policy).
        guard.RequirePrivileged();

        var runners = (await runnerService.GetManyAsync())
            .Select(a => new { a.Id, a.Name, a.Ip, a.Active });
        return JsonSerializer.Serialize(runners, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://projects/{id}", Name = "Reconmap Project", MimeType = "application/json")]
    [Description("A single project by its ID.")]
    public async Task<string> GetProject(int id)
    {
        await guard.RequireReadAsync("projects", id, id);

        var p = await projectService.GetByIdAsync(id) ?? throw new McpException("Project not found.");

        return JsonSerializer.Serialize(new { p.Id, p.Name, p.Description, p.Visibility, p.Archived }, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://projects/{id}/vulnerabilities", Name = "Reconmap Project Vulnerabilities", MimeType = "application/json")]
    [Description("The vulnerabilities of a single project.")]
    public async Task<string> GetProjectVulnerabilities(int id)
    {
        await guard.RequireReadAsync("projects", id, id);

        var page = await vulnerabilityService.GetManyAsync(new VulnerabilityFilter(ProjectId: id), Paging.Unbounded);

        var vulnerabilities = page.Data.Select(v => new { v.Id, v.ProjectId, v.Summary, v.Risk, v.Status });
        return JsonSerializer.Serialize(vulnerabilities, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://vulnerabilities/{id}", Name = "Reconmap Vulnerability", MimeType = "application/json")]
    [Description("A single vulnerability by its ID.")]
    public async Task<string> GetVulnerability(int id)
    {
        var v = await vulnerabilityService.GetByIdAsync(id) ?? throw new McpException("Vulnerability not found.");

        await guard.RequireReadAsync("vulnerabilities", v.ProjectId, v.Id);

        return JsonSerializer.Serialize(new
        {
            v.Id, v.ProjectId, v.AssetId, v.Summary, v.Description, v.Risk, v.Status, v.Substatus,
            v.CvssScore, v.CvssVector, v.ProofOfConcept, v.Impact, v.Remediation
        }, JsonOptions);
    }
}

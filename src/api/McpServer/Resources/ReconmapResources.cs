using System.Text.Json;
using ModelContextProtocol.Server;
using System.Threading.Tasks;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Reconmap.McpServer.Resources;

/// <summary>
/// Reconmap MCP resources for exposing entity data.
/// </summary>
public class ReconmapResources
{
    private readonly AppDbContext _dbContext;

    public ReconmapResources(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [McpServerResource(UriTemplate = "reconmap://projects", Name = "Reconmap Projects", MimeType = "application/json")]
    public async Task<string> GetProjects()
    {
        var projects = await _dbContext.Projects
            .Select(p => new { p.Id, p.Name, p.Visibility, p.Archived })
            .ToListAsync();
        return JsonSerializer.Serialize(projects, new JsonSerializerOptions { WriteIndented = true });
    }

    [McpServerResource(UriTemplate = "reconmap://tasks", Name = "Reconmap Tasks", MimeType = "application/json")]
    public async Task<string> GetTasks()
    {
        var tasks = await _dbContext.Tasks
            .Select(t => new { t.Id, t.ProjectId, t.Summary, t.Priority, t.Status })
            .ToListAsync();
        return JsonSerializer.Serialize(tasks, new JsonSerializerOptions { WriteIndented = true });
    }

    [McpServerResource(UriTemplate = "reconmap://vulnerabilities", Name = "Reconmap Vulnerabilities", MimeType = "application/json")]
    public async Task<string> GetVulnerabilities()
    {
        var vulnerabilities = await _dbContext.Vulnerabilities
            .Select(f => new { f.Id, f.ProjectId, f.Summary, f.Risk, f.Status })
            .ToListAsync();
        return JsonSerializer.Serialize(vulnerabilities, new JsonSerializerOptions { WriteIndented = true });
    }

    [McpServerResource(UriTemplate = "reconmap://runners", Name = "Reconmap Runners", MimeType = "application/json")]
    public async Task<string> GetRunners()
    {
        var runners = await _dbContext.Runners
            .Select(a => new { a.Id, a.Name, a.Ip, a.Active })
            .ToListAsync();
        return JsonSerializer.Serialize(runners, new JsonSerializerOptions { WriteIndented = true });
    }
}

using System.Text.Json;
using ModelContextProtocol.Server;
using System.Threading.Tasks;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace McpServer.Resources;

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

    [McpServerResource(UriTemplate = "reconmap://findings", Name = "Reconmap Findings", MimeType = "application/json")]
    public async Task<string> GetFindings()
    {
        var findings = await _dbContext.Vulnerabilities
            .Select(f => new { f.Id, f.ProjectId, f.Summary, f.Risk, f.Status })
            .ToListAsync();
        return JsonSerializer.Serialize(findings, new JsonSerializerOptions { WriteIndented = true });
    }

    [McpServerResource(UriTemplate = "reconmap://documents", Name = "Reconmap Documents", MimeType = "application/json")]
    public async Task<string> GetDocuments()
    {
        var documents = await _dbContext.Documents
            .Select(d => new { d.Id, d.ParentId, d.ParentType, d.Title, d.Visibility })
            .ToListAsync();
        return JsonSerializer.Serialize(documents, new JsonSerializerOptions { WriteIndented = true });
    }

    [McpServerResource(UriTemplate = "reconmap://agents", Name = "Reconmap Agents", MimeType = "application/json")]
    public async Task<string> GetAgents()
    {
        var agents = await _dbContext.Agents
            .Select(a => new { a.Id, a.Name, a.Ip, a.Active })
            .ToListAsync();
        return JsonSerializer.Serialize(agents, new JsonSerializerOptions { WriteIndented = true });
    }
}

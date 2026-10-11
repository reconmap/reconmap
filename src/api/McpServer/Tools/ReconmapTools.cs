using System.ComponentModel;
using ModelContextProtocol.Server;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace McpServer.Tools;

/// <summary>
/// Sample Reconmap MCP tools for demonstration purposes.
/// These tools can be invoked by MCP clients to interact with Reconmap.
/// </summary>
public class ReconmapTools
{
    private readonly AppDbContext _dbContext;

    public ReconmapTools(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [McpServerTool]
    [Description("Gets a list of Reconmap projects.")]
    public async Task<string> ListProjects()
    {
        var projects = await _dbContext.Projects
            .Select(p => new { p.Id, p.Name, p.Visibility, p.Archived })
            .ToListAsync();
        return JsonSerializer.Serialize(projects, new JsonSerializerOptions { WriteIndented = true });
    }

    [McpServerTool]
    [Description("Gets details about a specific project by its ID.")]
    public async Task<string> GetProjectDetails(
        [Description("The ID of the project to retrieve.")] int projectId)
    {
        var project = await _dbContext.Projects
            .Where(p => p.Id == projectId)
            .Select(p => new { p.Id, p.Name, p.Description, p.Visibility, p.Archived })
            .FirstOrDefaultAsync();
            
        if (project == null)
            return "Project not found.";
            
        return JsonSerializer.Serialize(project, new JsonSerializerOptions { WriteIndented = true });
    }
}

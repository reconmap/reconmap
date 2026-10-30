using System.ComponentModel;
using System.Text.Json;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Resources;

/// <summary>
/// MCP resources for findings. Every read is scoped to what the authenticated user may access.
/// </summary>
public class FindingResources(IFindingService findingService, McpAccessGuard guard)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    [McpServerResource(UriTemplate = "reconmap://findings", Name = "Reconmap Findings", MimeType = "application/json")]
    public async Task<string> GetFindings()
    {
        var visibleIds = await guard.VisibleProjectIdsAsync();

        var page = await findingService.GetManyAsync(new FindingFilter(VisibleProjectIds: visibleIds), Paging.Unbounded);

        var findings = page.Data.Select(f => new { f.Id, f.ProjectId, f.Summary, f.Risk, f.Status });
        return JsonSerializer.Serialize(findings, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://projects/{id}/findings", Name = "Reconmap Project Findings", MimeType = "application/json")]
    [Description("The findings of a single project.")]
    public async Task<string> GetProjectFindings(Guid id)
    {
        await guard.RequireReadAsync("projects", id, id);

        var page = await findingService.GetManyAsync(new FindingFilter(ProjectId: id), Paging.Unbounded);

        var findings = page.Data.Select(v => new { v.Id, v.ProjectId, v.Summary, v.Risk, v.Status });
        return JsonSerializer.Serialize(findings, JsonOptions);
    }

    [McpServerResource(UriTemplate = "reconmap://findings/{id}", Name = "Reconmap Finding", MimeType = "application/json")]
    [Description("A single finding by its ID.")]
    public async Task<string> GetFinding(Guid id)
    {
        var v = await findingService.GetByIdAsync(id) ?? throw new McpException("Finding not found.");

        await guard.RequireReadAsync("findings", v.ProjectId, v.Id);

        return JsonSerializer.Serialize(new
        {
            v.Id, v.ProjectId, v.AssetId, v.Summary, v.Description, v.Risk, v.Status, v.Substatus,
            v.CvssScore, v.CvssVector, v.ProofOfConcept, v.Impact, v.Remediation
        }, JsonOptions);
    }
}

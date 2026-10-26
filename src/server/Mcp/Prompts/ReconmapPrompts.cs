using System.ComponentModel;
using ModelContextProtocol;
using ModelContextProtocol.Server;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Security;

namespace Reconmap.McpServer.Prompts;

/// <summary>
/// Reusable MCP prompts. Each one checks that the caller can read the project before pointing the model at its data.
/// </summary>
[McpServerPromptType]
public class ReconmapPrompts(IProjectService projectService, McpAccessGuard guard)
{
    [McpServerPrompt(Name = "triage_vulnerabilities")]
    [Description("Triage the vulnerabilities of a project: prioritise them and propose next steps.")]
    public async Task<string> TriageVulnerabilities(
        [Description("Required. The ID (a UUID) of the project to triage.")] string projectId)
    {
        var id = ParseProjectId(projectId);
        var name = await ProjectNameAsync(id);

        return $$"""
                Triage the vulnerabilities of the Reconmap project "{{name}}" (ID {{id}}).

                Read the resource reconmap://projects/{{id}}/vulnerabilities, then fetch the details of the
                most severe ones with reconmap://vulnerabilities/{id}.

                Produce:
                1. Vulnerabilities ordered by priority, weighing risk, CVSS score and impact.
                2. Any that look like duplicates or share a root cause.
                3. A recommended remediation order, with the reason for each step.
                4. Vulnerabilities that lack the detail (description, proof of concept, remediation) to be actioned.
                """;
    }

    [McpServerPrompt(Name = "executive_summary")]
    [Description("Draft an executive summary of a project's security posture for a non-technical audience.")]
    public async Task<string> ExecutiveSummary(
        [Description("Required. The ID (a UUID) of the project to summarise.")] string projectId)
    {
        var id = ParseProjectId(projectId);
        var name = await ProjectNameAsync(id);

        return $$"""
                Draft an executive summary for the Reconmap project "{{name}}" (ID {{id}}).

                Read reconmap://projects/{{id}} and reconmap://projects/{{id}}/vulnerabilities.

                Write for a non-technical reader, in under 300 words:
                - Overall security posture in one or two sentences.
                - Counts of vulnerabilities by risk level and the most significant business impacts.
                - The top three actions to take, in priority order.
                Avoid jargon and do not include proof-of-concept details.
                """;
    }

    // MCP prompt arguments are always strings on the wire, so a Guid parameter fails to bind.
    private static Guid ParseProjectId(string projectId)
        => Guid.TryParse(projectId, out var id)
            ? id
            : throw new McpException(string.IsNullOrWhiteSpace(projectId)
                ? "The projectId argument is required: pass the ID (a UUID) of the project."
                : $"Invalid projectId '{projectId}': pass the ID (a UUID) of the project.");

    private async Task<string> ProjectNameAsync(Guid projectId)
    {
        await guard.RequireReadAsync("projects", projectId, projectId);

        var project = await projectService.GetByIdAsync(projectId) ?? throw new McpException("Project not found.");
        return project.Name;
    }
}

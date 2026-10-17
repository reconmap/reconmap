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
        [Description("The ID of the project to triage.")] int projectId)
    {
        var name = await ProjectNameAsync(projectId);

        return $$"""
                Triage the vulnerabilities of the Reconmap project "{{name}}" (ID {{projectId}}).

                Read the resource reconmap://projects/{{projectId}}/vulnerabilities, then fetch the details of the
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
        [Description("The ID of the project to summarise.")] int projectId)
    {
        var name = await ProjectNameAsync(projectId);

        return $$"""
                Draft an executive summary for the Reconmap project "{{name}}" (ID {{projectId}}).

                Read reconmap://projects/{{projectId}} and reconmap://projects/{{projectId}}/vulnerabilities.

                Write for a non-technical reader, in under 300 words:
                - Overall security posture in one or two sentences.
                - Counts of vulnerabilities by risk level and the most significant business impacts.
                - The top three actions to take, in priority order.
                Avoid jargon and do not include proof-of-concept details.
                """;
    }

    private async Task<string> ProjectNameAsync(int projectId)
    {
        await guard.RequireReadAsync("projects", projectId, projectId);

        var project = await projectService.GetByIdAsync(projectId) ?? throw new McpException("Project not found.");
        return project.Name;
    }
}

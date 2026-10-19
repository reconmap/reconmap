using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Reconmap.Api.Application.Commands;
using Reconmap.Api.Domain.Entities;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Reconmap.Api.Common;

namespace Reconmap.Api.Application.Services;

public interface IToolRecommendationService
{
    Task<ToolRecommendationResponse> RecommendToolsAsync(ToolRecommendationRequest request);
}

public class ToolRecommendationService(IAiChatClientFactory clientFactory, ILogger<ToolRecommendationService> logger) : IToolRecommendationService
{
    private static readonly string[] WebTargetTypes = ["url", "domain", "hostname", "ip"];

    /// <summary>
    /// Target types each tool can be pointed at.
    /// </summary>
    private static readonly Dictionary<string, string[]> ToolTargetTypes = new()
    {
        ["nmap"] = WebTargetTypes,
        ["testssl"] = WebTargetTypes,
        ["shcheck"] = ["url", "domain", "hostname"],
        ["subfinder"] = ["domain"],
        ["bandit"] = ["code_repo"],
        ["semgrep"] = ["code_repo"],
        ["snyk"] = ["code_repo"],
        ["trivy"] = ["code_repo"],
        ["syft"] = ["code_repo"],
    };

    /// <summary>
    /// Tools to run for each objective, in execution order.
    /// A null entry means "every tool that applies to the target type".
    /// </summary>
    private static readonly Dictionary<string, string[]?> ObjectiveTools = new(StringComparer.OrdinalIgnoreCase)
    {
        [ScanObjectives.FullReconnaissance] = null,
        [ScanObjectives.WebScan] = ["shcheck", "testssl", "nmap"],
        [ScanObjectives.CodeAudit] = ["bandit", "semgrep", "snyk", "trivy", "syft"],
        [ScanObjectives.SslTlsCheck] = ["testssl"],
    };

    private static readonly string[] FullReconOrder =
        ["subfinder", "nmap", "testssl", "shcheck", "bandit", "semgrep", "snyk", "trivy", "syft"];

    public async Task<ToolRecommendationResponse> RecommendToolsAsync(ToolRecommendationRequest request)
    {
        request.TargetType = request.TargetType.ToLowerInvariant();

        try
        {
            var response = await GetAiRecommendationsAsync(request);
            if (response != null && response.Recommendations.Any())
            {
                return response;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "AI tool recommendation failed or is not configured. Falling back to rule-based.");
        }

        return GetRuleBasedRecommendations(request);
    }

    private static IEnumerable<(ICommand Command, CommandUsageDefinition Usage)> ApplicableUsages(ToolRecommendationRequest request)
    {
        var allowedIds = ObjectiveTools.TryGetValue(request.Objective ?? string.Empty, out var ids) && ids != null
            ? ids
            : FullReconOrder;

        foreach (var toolId in allowedIds)
        {
            if (!ToolTargetTypes.TryGetValue(toolId, out var targetTypes) || !targetTypes.Contains(request.TargetType))
                continue;

            var cmd = CommandDiscovery.FindById(toolId);
            if (cmd == null) continue;

            foreach (var usage in cmd.Usages)
                yield return (cmd, usage);
        }
    }

    private async Task<ToolRecommendationResponse?> GetAiRecommendationsAsync(ToolRecommendationRequest request)
    {
        var applicable = ApplicableUsages(request).ToList();
        if (applicable.Count == 0) return null;

        var context = await clientFactory.CreateAsync(
            new AiUsageContext(AiFeatures.ToolRecommendation, request.ProjectId == 0 ? null : request.ProjectId));

        var catalog = applicable.Select(a => new
        {
            commandId = a.Command.Id,
            usageId = a.Usage.Id,
            description = a.Command.Description,
            usage = a.Usage.Description
        });

        var prompt = $$"""
            You are a security tool recommendation engine.
            Target: '{{request.Target}}' (type: {{request.TargetType}}). Objective: '{{request.Objective}}'.
            Choose, from the catalog below only, the tools that best serve the objective for this target, in the order they should run.
            Use only commandId/usageId pairs that appear in the catalog. Do not invent tools or arguments; arguments are filled in by the system.

            Return strictly this JSON:
            {
              "strategy": "one or two sentences describing the plan",
              "recommendations": [
                { "commandId": "string", "usageId": "string", "rationale": "why this tool for this target" }
              ]
            }

            Catalog: {{JsonSerializer.Serialize(catalog)}}
            """;

        var response = await context.Client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You return strictly valid JSON.",
                MaxOutputTokens = context.MaxOutputTokens
            });

        var json = response.Text;
        if (json.Contains("```json"))
            json = json.Split("```json")[1].Split("```")[0];
        else if (json.Contains("```"))
            json = json.Split("```")[1].Split("```")[0];

        AiPlan? plan;
        try
        {
            plan = JsonSerializer.Deserialize<AiPlan>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException)
        {
            return null;
        }

        if (plan?.Recommendations == null) return null;

        var result = new ToolRecommendationResponse { Strategy = plan.Strategy ?? string.Empty };
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var item in plan.Recommendations)
        {
            // Only accept catalog entries that apply to this target; drop anything the model made up.
            var match = applicable.FirstOrDefault(a =>
                a.Command.Id.Equals(item.CommandId, StringComparison.OrdinalIgnoreCase) &&
                a.Usage.Id.Equals(item.UsageId, StringComparison.OrdinalIgnoreCase));
            if (match.Command == null || !seen.Add(match.Usage.Id)) continue;

            var recommendation = BuildRecommendation(match.Command, match.Usage, request, item.Rationale);
            if (recommendation == null) continue;

            recommendation.Order = result.Recommendations.Count + 1;
            result.Recommendations.Add(recommendation);
        }

        return result;
    }

    private ToolRecommendationResponse GetRuleBasedRecommendations(ToolRecommendationRequest request)
    {
        var response = new ToolRecommendationResponse();

        foreach (var (cmd, usage) in ApplicableUsages(request))
        {
            var recommendation = BuildRecommendation(cmd, usage, request,
                $"{request.Objective} for {request.TargetType} targets.");
            if (recommendation == null) continue;

            recommendation.Order = response.Recommendations.Count + 1;
            response.Recommendations.Add(recommendation);
        }

        response.Strategy = response.Recommendations.Count == 0
            ? $"No tool supports the '{request.Objective}' objective for {request.TargetType} targets."
            : $"{request.Objective}: run {string.Join(", ", response.Recommendations.Select(r => r.CommandName))} against {request.Target}.";

        return response;
    }

    private ToolRecommendation? BuildRecommendation(ICommand cmd, CommandUsageDefinition usage,
        ToolRecommendationRequest request, string? rationale)
    {
        var arguments = CommandArguments.Resolve(usage.Arguments, request.Target, request.TargetType);
        if (arguments == null)
        {
            logger.LogWarning("Skipping {Usage}: arguments contain placeholders that cannot be resolved for target type {TargetType}",
                usage.Id, request.TargetType);
            return null;
        }

        return new ToolRecommendation
        {
            CommandId = cmd.Id,
            CommandName = cmd.Name,
            Description = cmd.Description,
            UsageId = usage.Id,
            ExecutablePath = usage.ExecutablePath,
            Arguments = arguments,
            Rationale = string.IsNullOrWhiteSpace(rationale) ? cmd.Description : rationale
        };
    }

    private sealed class AiPlan
    {
        public string? Strategy { get; set; }
        public List<AiItem>? Recommendations { get; set; }
    }

    private sealed class AiItem
    {
        public string? CommandId { get; set; }
        public string? UsageId { get; set; }
        public string? Rationale { get; set; }
    }
}

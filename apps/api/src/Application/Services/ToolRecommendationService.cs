using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using api_v2.Application.Commands;
using api_v2.Domain.Entities;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using api_v2.Common;

namespace api_v2.Application.Services;

public interface IToolRecommendationService
{
    Task<ToolRecommendationResponse> RecommendToolsAsync(ToolRecommendationRequest request);
}

public class ToolRecommendationService(IAiChatClientFactory clientFactory, ILogger<ToolRecommendationService> logger) : IToolRecommendationService
{
    public async Task<ToolRecommendationResponse> RecommendToolsAsync(ToolRecommendationRequest request)
    {
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

    private async Task<ToolRecommendationResponse?> GetAiRecommendationsAsync(ToolRecommendationRequest request)
    {
        var context = await clientFactory.CreateAsync();

        var allCommands = CommandDiscovery.GetAll();
        var catalog = allCommands.Select(c => new {
            c.Id,
            c.Name,
            c.Description,
            Usages = c.Usages.Select(u => new { u.Id, u.Arguments })
        });

        var prompt = $@"
You are a security tool recommendation engine.
Given the target '{request.Target}' of type '{request.TargetType}', recommend tools from the catalog.
Pre-fill arguments replacing placeholders like {{{{{{Host|||localhost}}}}}}.

Strictly follow this JSON schema:
{{
  ""Recommendations"": [
    {{
      ""CommandId"": ""string"",
      ""CommandName"": ""string"",
      ""Description"": ""string"",
      ""UsageId"": ""string"",
      ""RecommendedArguments"": ""string"",
      ""Rationale"": ""string""
    }}
  ]
}}

Catalog: {JsonSerializer.Serialize(catalog)}
";

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

        try
        {
            return JsonSerializer.Deserialize<ToolRecommendationResponse>(json);
        }
        catch
        {
            return null;
        }
    }

    private ToolRecommendationResponse GetRuleBasedRecommendations(ToolRecommendationRequest request)
    {
        var response = new ToolRecommendationResponse();
        var type = request.TargetType.ToLowerInvariant();

        var targetToTools = new Dictionary<string, string[]>
        {
            { "url", new[] { "shcheck", "testssl", "nmap" } },
            { "domain", new[] { "subfinder", "nmap", "testssl" } },
            { "ip", new[] { "nmap" } },
            { "hostname", new[] { "nmap", "testssl", "shcheck" } },
            { "code_repo", new[] { "bandit", "semgrep", "snyk", "trivy", "syft" } }
        };

        if (!targetToTools.TryGetValue(type, out var tools))
        {
            return response;
        }

        foreach (var toolId in tools)
        {
            var cmd = CommandDiscovery.FindById(toolId);
            if (cmd != null && cmd.Usages.Any())
            {
                var usage = cmd.Usages.First();
                var args = usage.Arguments ?? string.Empty;

                // Pre-fill argument placeholders
                args = args.Replace("{{{Host|||localhost}}}", request.Target)
                           .Replace("{{{URL|||https://example.com}}}", request.Target)
                           .Replace("{{{Domain|||example.com}}}", request.Target)
                           .Replace("{{{IP|||127.0.0.1}}}", request.Target)
                           .Replace("{{{Target|||example.com}}}", request.Target)
                           .Replace("{{{Path|||/}}}", request.Target);

                response.Recommendations.Add(new ToolRecommendation
                {
                    CommandId = cmd.Id,
                    CommandName = cmd.Name,
                    Description = cmd.Description,
                    UsageId = usage.Id,
                    RecommendedArguments = args,
                    Rationale = $"Rule-based recommendation for {type} targets."
                });
            }
        }

        return response;
    }
}

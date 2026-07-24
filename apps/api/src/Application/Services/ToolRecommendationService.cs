using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using api_v2.Application.Commands;
using api_v2.Domain.Entities;
using Azure.AI.OpenAI;
using Microsoft.Extensions.AI;
using OllamaSharp;
using OpenAI;
using Microsoft.Extensions.Logging;

namespace api_v2.Application.Services;

public interface IToolRecommendationService
{
    Task<ToolRecommendationResponse> RecommendToolsAsync(ToolRecommendationRequest request);
}

public class ToolRecommendationService(IAiSettingsService aiSettingsService, ILogger<ToolRecommendationService> logger) : IToolRecommendationService
{
    public async Task<ToolRecommendationResponse> RecommendToolsAsync(ToolRecommendationRequest request)
    {
        try
        {
            var aiSettings = await aiSettingsService.GetSettingsAsync();
            var response = await GetAiRecommendationsAsync(request, aiSettings);
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

    private async Task<ToolRecommendationResponse?> GetAiRecommendationsAsync(ToolRecommendationRequest request, AiSettings settings)
    {
        var client = GetChatClient(settings);
        
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

        var response = await client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You return strictly valid JSON.",
                MaxOutputTokens = settings.MaxOutputTokens
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

    private IChatClient GetChatClient(AiSettings settings)
    {
        return settings.Provider switch
        {
            "Ollama" => new OllamaApiClient(
                new Uri(settings.OllamaBaseUrl ?? "http://localhost:11434/"),
                settings.OllamaModel ?? "llama3.2"),
            "AzureOpenAI" => new AzureOpenAIClient(
                new Uri(settings.AzureOpenAiEndpoint ?? throw new InvalidOperationException("Azure OpenAI Endpoint not configured")),
                new System.ClientModel.ApiKeyCredential(settings.AzureOpenAiApiKey ?? throw new InvalidOperationException("Azure OpenAI API Key not configured")))
                .AsChatClient(settings.AzureOpenAiDeployment ?? "gpt-4o"),
            "OpenRouter" => new OpenAIClient(
                new System.ClientModel.ApiKeyCredential(settings.OpenRouterApiKey ?? throw new InvalidOperationException("OpenRouter API Key not configured")),
                new OpenAIClientOptions { Endpoint = new Uri("https://openrouter.ai/api/v1") })
                .AsChatClient(settings.OpenRouterModel ?? "meta-llama/llama-3.1-70b-instruct"),
            _ => throw new InvalidOperationException($"AI provider '{settings.Provider}' is not supported or configured correctly.")
        };
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

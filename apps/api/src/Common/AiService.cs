using System.Text.Json;
using System.Text.Json.Serialization;
using api_v2.Application.Services;
using Azure.AI.OpenAI;
using Microsoft.Extensions.AI;
using OllamaSharp;
using OpenAI;

namespace api_v2.Common;

public class AiParsingResult
{
    [JsonPropertyName("assets")]
    public List<AiAsset> Assets { get; set; } = new();

    [JsonPropertyName("vulnerabilities")]
    public List<AiVulnerability> Vulnerabilities { get; set; } = new();
}

public class AiAsset
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = "hostname";
}

public class AiVulnerability
{
    [JsonPropertyName("summary")]
    public string Summary { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("risk")]
    public string Risk { get; set; } = "medium";

    [JsonPropertyName("remediation")]
    public string Remediation { get; set; } = string.Empty;

    [JsonPropertyName("proof_of_concept")]
    public string ProofOfConcept { get; set; } = string.Empty;
}

public interface IAiService
{
    Task<string> GenerateRemediationAsync(string vulnerabilitySummary);
    Task<AiParsingResult> ParseCommandOutputAsync(string toolName, string output);
    Task<string> EnrichAssetAsync(string assetName, string assetType);
    Task<string> TriageVulnerabilityAsync(string summary, string description);
}

public sealed class AiService(IAiSettingsService aiSettingsService) : IAiService
{
    private async Task<IChatClient> GetClientAsync()
    {
        var settings = await aiSettingsService.GetSettingsAsync();

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

    public async Task<string> GenerateRemediationAsync(string summary)
    {
        var prompt = $"Write instructions on how to remediate this vulnerability: {summary}";

        var settings = await aiSettingsService.GetSettingsAsync();
        var client = await GetClientAsync();
        var response = await client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a vulnerability and pentesting expert system",
                MaxOutputTokens = settings.MaxOutputTokens
            });

        return response.Text;
    }

    public async Task<AiParsingResult> ParseCommandOutputAsync(string toolName, string output)
    {
        var prompt = $@"
You are a cybersecurity expert. Parse the following command output from the tool '{toolName}' into a structured JSON format.
The output should contain a list of Assets (targets) and Vulnerabilities.

Strictly follow this JSON schema:
{{
  ""assets"": [
    {{ ""name"": ""string (e.g. hostname, IP)"", ""type"": ""string (e.g. hostname, ip, url)"" }}
  ],
  ""vulnerabilities"": [
    {{
      ""summary"": ""string (short title)"",
      ""description"": ""string (detailed description)"",
      ""risk"": ""string (low, medium, high, critical)"",
      ""remediation"": ""string (how to fix)"",
      ""proof_of_concept"": ""string (evidence from the output)""
    }}
  ]
}}

If no assets or vulnerabilities are found, return empty lists.
Do not include any text outside the JSON block.

Command Output:
{output}
";

        var settings = await aiSettingsService.GetSettingsAsync();
        var client = await GetClientAsync();
        var response = await client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a strict JSON parser for security tool outputs.",
                MaxOutputTokens = settings.MaxOutputTokens
            });

        var json = response.Text;

        // Clean markdown code blocks if present
        if (json.Contains("```json"))
        {
            json = json.Split("```json")[1].Split("```")[0];
        }
        else if (json.Contains("```"))
        {
            json = json.Split("```")[1].Split("```")[0];
        }

        try
        {
            return JsonSerializer.Deserialize<AiParsingResult>(json) ?? new AiParsingResult();
        }
        catch (JsonException)
        {
            // Fallback or log error
            return new AiParsingResult();
        }
    }

    public async Task<string> EnrichAssetAsync(string assetName, string assetType)
    {
        var prompt = $@"You are an autonomous penetration testing agent. Given the following asset, produce a concise tactical plan:

Asset: {assetName}
Type: {assetType}

Provide:
1. **Recommended tools** – list the most relevant CLI tools for this asset type
2. **Priority commands** – exact runnable commands with the asset substituted in, ordered by impact
3. **Key things to look for** – specific indicators of compromise or misconfigurations relevant to this asset type

Be concise and actionable. Format as markdown.";

        var settings = await aiSettingsService.GetSettingsAsync();
        var client = await GetClientAsync();
        var response = await client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are an autonomous penetration testing agent. Be tactical, concise, and precise.",
                MaxOutputTokens = settings.MaxOutputTokens
            });

        return response.Text;
    }

    public async Task<string> TriageVulnerabilityAsync(string summary, string description)
    {
        var details = string.IsNullOrWhiteSpace(description) ? summary : $"{summary}\n\n{description}";
        var prompt = $@"You are a penetration testing triage agent. Rapidly assess the following vulnerability finding:

{details}

Provide a brief structured triage report with:
- **Severity assessment** – confirm or adjust the risk level with justification
- **Exploitability** – how easily could this be exploited in the wild?
- **Attack surface** – what systems or data are at risk?
- **Immediate actions** – up to 3 specific next steps an analyst should take right now
- **False positive check** – any reasons this might not be a real issue?

Be concise. Format as markdown.";

        var settings = await aiSettingsService.GetSettingsAsync();
        var client = await GetClientAsync();
        var response = await client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a rapid vulnerability triage agent. Provide fast, accurate, actionable assessments.",
                MaxOutputTokens = settings.MaxOutputTokens
            });

        return response.Text;
    }
}

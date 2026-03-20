using System.Text.Json;
using System.Text.Json.Serialization;
using api_v2.Application.Services;
using Microsoft.Extensions.AI;
using OllamaSharp;

namespace api_v2.Common;

public class AiParsingResult
{
    [JsonPropertyName("assets")]
    public List<AiAsset> Assets { get; set; } = new();

    [JsonPropertyName("findings")]
    public List<AiFinding> Findings { get; set; } = new();
}

public class AiAsset
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("kind")]
    public string Kind { get; set; } = "hostname";
}

public class AiFinding
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
    Task<string> EnrichAssetAsync(string assetName, string assetKind);
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
            // AzureOpenAI and OpenRouter support can be added here once the necessary adapters are fully integrated.
            // They require Microsoft.Extensions.AI.OpenAI and Azure.AI.OpenAI packages.
            _ => throw new InvalidOperationException($"AI provider '{settings.Provider}' is not yet supported or configured correctly.")
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
The output should contain a list of Assets (targets) and Vulnerabilities (findings).

Strictly follow this JSON schema:
{{
  ""assets"": [
    {{ ""name"": ""string (e.g. hostname, IP)"", ""kind"": ""string (e.g. hostname, ip, url)"" }}
  ],
  ""findings"": [
    {{
      ""summary"": ""string (short title)"",
      ""description"": ""string (detailed description)"",
      ""risk"": ""string (low, medium, high, critical)"",
      ""remediation"": ""string (how to fix)"",
      ""proof_of_concept"": ""string (evidence from the output)""
    }}
  ]
}}

If no assets or findings are found, return empty lists.
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

    public async Task<string> EnrichAssetAsync(string assetName, string assetKind)
    {
        var prompt = $"As a penetration tester, suggest the next steps and potential tools to use for scanning this asset: {assetName} (Kind: {assetKind}). Provide a concise list of recommended commands.";

        var settings = await aiSettingsService.GetSettingsAsync();
        var client = await GetClientAsync();
        var response = await client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a pentesting strategist.",
                MaxOutputTokens = settings.MaxOutputTokens
            });

        return response.Text;
    }
}

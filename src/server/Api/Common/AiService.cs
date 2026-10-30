using System.Text.Json;
using System.Text.Json.Serialization;
using Reconmap.Api.Application.Services;
using Microsoft.Extensions.AI;

namespace Reconmap.Api.Common;

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

    [JsonPropertyName("type")]
    public string Type { get; set; } = "hostname";

    [JsonPropertyName("children")]
    public List<AiAsset> Children { get; set; } = new();
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
    Task<string> GenerateRemediationAsync(string findingSummary, Guid? projectId = null, int? userId = null);
    Task<AiParsingResult> ParseCommandOutputAsync(string toolName, string output, Guid? projectId = null, int? userId = null);
    Task<string> EnrichAssetAsync(string assetName, string assetType, Guid? projectId = null, int? userId = null);
    Task<string> TriageFindingAsync(string summary, string description, Guid? projectId = null, int? userId = null);
}

public sealed class AiService(IAiChatClientFactory clientFactory) : IAiService
{
    public async Task<string> GenerateRemediationAsync(string summary, Guid? projectId = null, int? userId = null)
    {
        var prompt = $"Write instructions on how to remediate this finding: {summary}";

        var context = await clientFactory.CreateAsync(new AiUsageContext(AiFeatures.Remediation, projectId, userId));
        var response = await context.Client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a finding and pentesting expert system",
                MaxOutputTokens = context.MaxOutputTokens
            });

        return response.Text;
    }

    public async Task<AiParsingResult> ParseCommandOutputAsync(string toolName, string output, Guid? projectId = null, int? userId = null)
    {
        var prompt = $@"
You are a cybersecurity expert. Parse the following command output from the tool '{toolName}' into a structured JSON format.
The output should contain a list of Assets (targets) and Findings.

Strictly follow this JSON schema:
{{
  ""assets"": [
    {{ ""name"": ""string (e.g. hostname, IP, port, path, file)"", ""type"": ""string (free-form, e.g. hostname, ip, port, url, path, file)"", ""children"": [ /* nested assets found under this one, e.g. ports of a host, paths of a web app */ ] }}
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

        var context = await clientFactory.CreateAsync(new AiUsageContext(AiFeatures.CommandParsing, projectId, userId));
        var response = await context.Client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a strict JSON parser for security tool outputs.",
                MaxOutputTokens = context.MaxOutputTokens
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

    public async Task<string> EnrichAssetAsync(string assetName, string assetType, Guid? projectId = null, int? userId = null)
    {
        var prompt = $@"You are an autonomous penetration testing agent. Given the following asset, produce a concise tactical plan:

Asset: {assetName}
Type: {assetType}

Provide:
1. **Recommended tools** – list the most relevant CLI tools for this asset type
2. **Priority commands** – exact runnable commands with the asset substituted in, ordered by impact
3. **Key things to look for** – specific indicators of compromise or misconfigurations relevant to this asset type

Be concise and actionable. Format as markdown.";

        var context = await clientFactory.CreateAsync(new AiUsageContext(AiFeatures.AssetEnrichment, projectId, userId));
        var response = await context.Client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are an autonomous penetration testing agent. Be tactical, concise, and precise.",
                MaxOutputTokens = context.MaxOutputTokens
            });

        return response.Text;
    }

    public async Task<string> TriageFindingAsync(string summary, string description, Guid? projectId = null, int? userId = null)
    {
        var details = string.IsNullOrWhiteSpace(description) ? summary : $"{summary}\n\n{description}";
        var prompt = $@"You are a penetration testing triage agent. Rapidly assess the following finding finding:

{details}

Provide a brief structured triage report with:
- **Severity assessment** – confirm or adjust the risk level with justification
- **Exploitability** – how easily could this be exploited in the wild?
- **Attack surface** – what systems or data are at risk?
- **Immediate actions** – up to 3 specific next steps an analyst should take right now
- **False positive check** – any reasons this might not be a real issue?

Be concise. Format as markdown.";

        var context = await clientFactory.CreateAsync(new AiUsageContext(AiFeatures.Triage, projectId, userId));
        var response = await context.Client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a rapid finding triage agent. Provide fast, accurate, actionable assessments.",
                MaxOutputTokens = context.MaxOutputTokens
            });

        return response.Text;
    }
}

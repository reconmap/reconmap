using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using OllamaSharp;

namespace api_v2.Common;

public sealed class AiOptions
{
    public string Provider { get; set; } = default!;
    public string SystemPrompt { get; set; } = default!;
    public int MaxOutputTokens { get; set; }

    public OllamaOptions Ollama { get; set; } = new();
//    public AzureOpenAiOptions AzureOpenAI { get; set; } = new();
//    public OpenRouterOptions OpenRouter { get; set; } = new();
}

public sealed class OllamaOptions
{
    public string BaseUrl { get; set; } = default!;
    public string Model { get; set; } = default!;
}

public interface IAiService
{
    Task<string> GenerateRemediationAsync(string vulnerabilitySummary);
}

public sealed class AiService(IOptions<AiOptions> options) : IAiService
{
    private readonly AiOptions _options = options.Value;

    public async Task<string> GenerateRemediationAsync(string summary)
    {
        var prompt = $"Write instructions on how to remediate this vulnerability: {summary}";

        IChatClient client = _options.Provider switch
        {
            "Ollama" => new OllamaApiClient(
                new Uri(_options.Ollama.BaseUrl),
                _options.Ollama.Model),

            /*
            "AzureOpenAI" => new AzureOpenAiChatClient(
                _options.AzureOpenAI.Endpoint,
                _options.AzureOpenAI.ApiKey,
                _options.AzureOpenAI.Deployment),

            "OpenRouter" => new OpenRouterChatClient(
                _options.OpenRouter.ApiKey,
                _options.OpenRouter.Model),
                */

            _ => throw new InvalidOperationException("Unknown AI provider")
        };

        var response = await client.GetResponseAsync(
            prompt,
            new ChatOptions
            {
                Instructions = "You are a vulnerability and pentesting expert system",
                MaxOutputTokens = _options.MaxOutputTokens
            });

        return response.Text;
    }
}

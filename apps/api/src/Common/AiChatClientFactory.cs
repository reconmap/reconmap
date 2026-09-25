using api_v2.Application.Services;
using Azure.AI.OpenAI;
using Microsoft.Extensions.AI;
using OllamaSharp;
using OpenAI;

namespace api_v2.Common;

public sealed record AiChatClientContext(IChatClient Client, int MaxOutputTokens);

public interface IAiChatClientFactory
{
    Task<AiChatClientContext> CreateAsync(CancellationToken cancellationToken = default);
}

public sealed class AiChatClientFactory(IAiSettingsService settingsService) : IAiChatClientFactory
{
    public async Task<AiChatClientContext> CreateAsync(CancellationToken cancellationToken = default)
    {
        var settings = await settingsService.GetRuntimeSettingsAsync(cancellationToken);
        var provider = settings.Provider;
        var client = provider.Adapter.ToLowerInvariant() switch
        {
            "ollama" => new OllamaApiClient(
                new Uri(GetRequired(settings, "baseUrl")),
                GetRequired(settings, "model")),
            "azure-openai" => new AzureOpenAIClient(
                    new Uri(GetRequired(settings, "endpoint")),
                    new System.ClientModel.ApiKeyCredential(GetRequired(settings, "apiKey")))
                .GetChatClient(GetRequired(settings, "deployment"))
                .AsIChatClient(),
            "openai-compatible" => new OpenAIClient(
                    new System.ClientModel.ApiKeyCredential(GetRequired(settings, "apiKey")),
                    new OpenAIClientOptions
                    {
                        Endpoint = new Uri(provider.Endpoint ??
                                           throw new InvalidOperationException(
                                               $"{provider.Name} endpoint is not configured."))
                    })
                .GetChatClient(GetRequired(settings, "model"))
                .AsIChatClient(),
            _ => throw new InvalidOperationException(
                $"AI provider '{provider.Id}' uses unsupported adapter '{provider.Adapter}'.")
        };

        return new AiChatClientContext(client, settings.MaxOutputTokens);
    }

    private static string GetRequired(AiRuntimeSettings settings, string key)
    {
        if (settings.Values.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value))
            return value;

        var field = settings.Provider.Fields.FirstOrDefault(f =>
            f.Key.Equals(key, StringComparison.OrdinalIgnoreCase));
        throw new InvalidOperationException(
            $"{settings.Provider.Name} {field?.Label ?? key} is not configured.");
    }
}

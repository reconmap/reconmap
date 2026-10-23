using System.Net;
using System.Text.Json;
using Reconmap.Api.Application.Services;

namespace Reconmap.Api.Common;

public sealed record AiModelDescriptor(
    string Id,
    string? Name,
    int? ContextWindow,
    IReadOnlyList<string> InputModalities,
    IReadOnlyList<string> ReasoningEfforts);

public sealed record AiModelCatalogResult(
    string ProviderId,
    string Capability,
    string Source,
    bool Degraded,
    string? Message,
    IReadOnlyList<AiModelDescriptor> Models);

public interface IAiModelCatalogService
{
    Task<AiModelCatalogResult> GetModelsAsync(
        string providerId,
        string? capability = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Discovers the models a provider account can actually use. The API key never leaves the server:
/// the dashboard receives only model metadata. A successful live response is authoritative; a small
/// verified list from the provider definition keeps a fresh installation usable during an outage.
/// </summary>
public sealed class AiModelCatalogService(
    IHttpClientFactory httpClientFactory,
    IAiSettingsService settingsService,
    ILogger<AiModelCatalogService>? logger = null) : IAiModelCatalogService
{
    private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(10);
    private const int MaxResponseBytes = 1024 * 1024;
    private const int MaxModels = 500;

    private static readonly Dictionary<string, string[]> EndpointTypesByCapability =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["chat"] = ["openai", "anthropic", "gemini", "openai-response"],
            ["embedding"] = ["embeddings"],
            ["image"] = ["image-generation"],
            ["video"] = ["openai-video"],
            ["rerank"] = ["jina-rerank"]
        };

    public async Task<AiModelCatalogResult> GetModelsAsync(
        string providerId,
        string? capability = null,
        CancellationToken cancellationToken = default)
    {
        var settings = await settingsService.GetProviderRuntimeSettingsAsync(providerId, cancellationToken);
        var provider = settings.Provider;
        var modelField = provider.Fields.FirstOrDefault(field =>
            field.Type.Equals("model", StringComparison.OrdinalIgnoreCase));
        if (modelField == null)
            throw new InvalidOperationException($"AI provider '{provider.Id}' does not expose a model catalog.");

        var selectedCapability = NormalizeCapability(capability ?? modelField.Capability);
        var endpoint = provider.Endpoint;
        if (string.IsNullOrWhiteSpace(endpoint) || !Uri.TryCreate(endpoint, UriKind.Absolute, out var baseUri))
            throw new InvalidOperationException($"{provider.Name} endpoint is not configured.");

        var apiKeyField = provider.Fields.FirstOrDefault(field =>
            field.Type.Equals("secret", StringComparison.OrdinalIgnoreCase));
        var apiKey = apiKeyField != null && settings.Values.TryGetValue(apiKeyField.Key, out var key)
            ? key
            : null;
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException($"{provider.Name} API key is not configured.");

        try
        {
            var models = await FetchLiveAsync(baseUri, apiKey, selectedCapability, cancellationToken);
            return new AiModelCatalogResult(
                provider.Id, selectedCapability, "live", false, null, models);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            var reason = DescribeFailure(exception);
            logger?.LogWarning(
                "Live model discovery failed for {Provider} ({Reason}); using verified fallback catalog.",
                provider.Id, reason);
            return new AiModelCatalogResult(
                provider.Id,
                selectedCapability,
                "verified-fallback",
                true,
                $"Live model discovery failed ({reason}). Showing verified fallback models.",
                BuildFallback(provider, selectedCapability));
        }
    }

    private async Task<IReadOnlyList<AiModelDescriptor>> FetchLiveAsync(
        Uri baseUri,
        string apiKey,
        string capability,
        CancellationToken cancellationToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(RequestTimeout);

        var url = new Uri(
            baseUri.AbsoluteUri.TrimEnd('/') + "/models?capability=" + Uri.EscapeDataString(capability));
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

        var client = httpClientFactory.CreateClient();
        using var response = await client.SendAsync(
            request, HttpCompletionOption.ResponseHeadersRead, timeout.Token);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException(
                $"catalog request returned HTTP {(int)response.StatusCode}",
                null,
                response.StatusCode);

        await using var stream = await response.Content.ReadAsStreamAsync(timeout.Token);
        var buffer = await ReadAtMostAsync(stream, MaxResponseBytes, timeout.Token);
        return ParseModels(buffer, capability);
    }

    internal static IReadOnlyList<AiModelDescriptor> ParseModels(ReadOnlySpan<byte> payload, string capability)
    {
        if (payload.IsEmpty)
            return [];

        using var document = JsonDocument.Parse(payload.ToArray());
        if (!document.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
            throw new JsonException("catalog response has no data array");

        var models = new List<AiModelDescriptor>();
        foreach (var item in data.EnumerateArray())
        {
            if (models.Count >= MaxModels)
                break;
            if (item.ValueKind != JsonValueKind.Object)
                continue;
            if (!item.TryGetProperty("id", out var idElement) || idElement.ValueKind != JsonValueKind.String)
                continue;
            var id = idElement.GetString();
            if (string.IsNullOrWhiteSpace(id))
                continue;

            var endpointTypes = ReadStringArray(item, "supported_endpoint_types");
            if (!SupportsCapability(endpointTypes, capability))
                continue;

            var inputModalities = ReadNestedStringArray(item, "architecture", "input_modalities");
            if (capability.Equals("chat", StringComparison.OrdinalIgnoreCase) &&
                inputModalities.Count > 0 &&
                !inputModalities.Contains("text", StringComparer.OrdinalIgnoreCase))
                continue;

            models.Add(new AiModelDescriptor(
                id,
                ReadString(item, "name"),
                ReadInt(item, "context_length") ?? ReadInt(item, "context_window"),
                inputModalities,
                ReadStringArray(item, "reasoning_efforts")));
        }

        return models;
    }

    internal static bool SupportsCapability(IReadOnlyList<string> endpointTypes, string capability)
    {
        if (!EndpointTypesByCapability.TryGetValue(capability, out var expected))
            return false;

        // A catalog entry without endpoint metadata is only trusted for chat: it is the provider's
        // OpenAI-compatible default. Every other capability must be proven by metadata (fail closed).
        if (endpointTypes.Count == 0)
            return capability.Equals("chat", StringComparison.OrdinalIgnoreCase);

        return endpointTypes.Any(type =>
            expected.Contains(type, StringComparer.OrdinalIgnoreCase));
    }

    private static IReadOnlyList<AiModelDescriptor> BuildFallback(
        AiProviderDefinition provider,
        string capability)
    {
        if (!capability.Equals("chat", StringComparison.OrdinalIgnoreCase))
            return [];

        return provider.VerifiedModels
            .Select(model => new AiModelDescriptor(
                model.Id,
                model.Name,
                model.ContextWindow,
                model.InputModalities,
                model.ReasoningEfforts))
            .ToList();
    }

    private static string NormalizeCapability(string? capability)
    {
        var value = string.IsNullOrWhiteSpace(capability) ? "chat" : capability.Trim();
        if (!EndpointTypesByCapability.ContainsKey(value))
            throw new ArgumentException($"Unsupported model capability '{value}'.", nameof(capability));
        return value;
    }

    private static string DescribeFailure(Exception exception) => exception switch
    {
        HttpRequestException { StatusCode: { } status } =>
            $"HTTP {(int)status}",
        HttpRequestException => "network error",
        JsonException => "invalid catalog response",
        OperationCanceledException => "request timed out",
        _ => "discovery error"
    };

    private static async Task<byte[]> ReadAtMostAsync(
        Stream stream,
        int maxBytes,
        CancellationToken cancellationToken)
    {
        var buffer = new MemoryStream();
        var chunk = new byte[8192];
        int read;
        while ((read = await stream.ReadAsync(chunk, cancellationToken)) > 0)
        {
            if (buffer.Length + read > maxBytes)
                throw new InvalidDataException("catalog response exceeded the size limit");
            buffer.Write(chunk, 0, read);
        }

        return buffer.ToArray();
    }

    private static string? ReadString(JsonElement item, string property) =>
        item.TryGetProperty(property, out var element) && element.ValueKind == JsonValueKind.String
            ? element.GetString()
            : null;

    private static int? ReadInt(JsonElement item, string property) =>
        item.TryGetProperty(property, out var element) &&
        element.ValueKind == JsonValueKind.Number &&
        element.TryGetInt32(out var value) &&
        value > 0
            ? value
            : null;

    private static IReadOnlyList<string> ReadStringArray(JsonElement item, string property)
    {
        if (!item.TryGetProperty(property, out var element) || element.ValueKind != JsonValueKind.Array)
            return [];

        return element.EnumerateArray()
            .Where(value => value.ValueKind == JsonValueKind.String)
            .Select(value => value.GetString())
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value!)
            .ToList();
    }

    private static IReadOnlyList<string> ReadNestedStringArray(
        JsonElement item,
        string parent,
        string property)
    {
        if (!item.TryGetProperty(parent, out var element) || element.ValueKind != JsonValueKind.Object)
            return [];

        return ReadStringArray(element, property);
    }
}

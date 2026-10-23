using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;

namespace Api.Tests.Common;

public class AiModelCatalogServiceTests
{
    private static readonly AiProviderDefinition Provider = new()
    {
        Id = "OrcaRouter",
        Name = "OrcaRouter Cyber Inference",
        Adapter = "openai-compatible",
        Endpoint = "https://api.orcarouter.ai/v1",
        Fields =
        [
            new AiProviderFieldDefinition
            {
                Key = "apiKey", Label = "API key", Type = "secret", Required = true
            },
            new AiProviderFieldDefinition
            {
                Key = "model", Label = "Model", Type = "model", Capability = "chat",
                Required = true, DefaultValue = "orcarouter/auto"
            }
        ],
        VerifiedModels =
        [
            new AiProviderModelDefinition
            {
                Id = "orcarouter/auto", Name = "OrcaRouter Auto", InputModalities = ["text"]
            },
            new AiProviderModelDefinition
            {
                Id = "openai/gpt-5.5", Name = "GPT-5.5", InputModalities = ["text"],
                ReasoningEfforts = ["low", "medium", "high", "xhigh"]
            },
            new AiProviderModelDefinition
            {
                Id = "orca/orcacyber-ultra-1.0", Name = "OrcaCyber Ultra", InputModalities = ["text"]
            }
        ]
    };

    private static readonly string CatalogJson = """
    {
      "object": "list",
      "data": [
        {
          "id": "orcarouter/auto",
          "object": "model",
          "supported_endpoint_types": ["openai", "anthropic", "gemini", "openai-response"]
        },
        {
          "id": "vendor/text-only",
          "object": "model",
          "supported_endpoint_types": ["openai"]
        },
        {
          "id": "vendor/vision-chat",
          "object": "model",
          "supported_endpoint_types": ["openai"],
          "architecture": { "input_modalities": ["text", "image"] }
        },
        {
          "id": "vendor/image-only-chat",
          "object": "model",
          "supported_endpoint_types": ["openai"],
          "architecture": { "input_modalities": ["image"] }
        },
        {
          "id": "vendor/embedding",
          "object": "model",
          "supported_endpoint_types": ["embeddings"]
        },
        {
          "id": "vendor/image-gen",
          "object": "model",
          "supported_endpoint_types": ["image-generation"]
        },
        {
          "id": "vendor/video",
          "object": "model",
          "supported_endpoint_types": ["openai-video"]
        },
        {
          "id": "vendor/rerank",
          "object": "model",
          "supported_endpoint_types": ["jina-rerank"]
        }
      ]
    }
    """;

    private sealed class StubHandler(
        Func<HttpRequestMessage, HttpResponseMessage> respond,
        Action<HttpRequestMessage>? capture = null) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            capture?.Invoke(request);
            return Task.FromResult(respond(request));
        }
    }

    private sealed class StubFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed class StubSettingsService(
        AiProviderDefinition provider,
        IReadOnlyDictionary<string, string> values) : IAiSettingsService
    {
        public Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<AiSettingsResponse> UpdateAsync(
            AiSettingsUpdateRequest request, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<AiRuntimeSettings> GetRuntimeSettingsAsync(CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<AiProviderRuntimeSettings> GetProviderRuntimeSettingsAsync(
            string providerId, CancellationToken cancellationToken = default)
        {
            if (!providerId.Equals(provider.Id, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException($"AI provider '{providerId}' is not configured.");
            return Task.FromResult(new AiProviderRuntimeSettings(provider, values));
        }
    }

    private static AiModelCatalogService CreateService(
        Func<HttpRequestMessage, HttpResponseMessage> respond,
        IReadOnlyDictionary<string, string>? values = null,
        Action<HttpRequestMessage>? capture = null) =>
        new(new StubFactory(new StubHandler(respond, capture)),
            new StubSettingsService(Provider, values ?? DefaultValues()));

    private static Dictionary<string, string> DefaultValues() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["apiKey"] = "sk-orca-test-not-a-real-key",
        ["model"] = "orcarouter/auto"
    };

    private static HttpResponseMessage JsonResponse(string json, HttpStatusCode status = HttpStatusCode.OK) =>
        new(status) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    [Fact]
    public async Task GetModelsAsync_ChatCatalogKeepsOnlyTextCapableChatModels()
    {
        var service = CreateService(_ => JsonResponse(CatalogJson));

        var result = await service.GetModelsAsync("OrcaRouter");

        Assert.Equal("live", result.Source);
        Assert.False(result.Degraded);
        Assert.Equal(
            ["orcarouter/auto", "vendor/text-only", "vendor/vision-chat"],
            result.Models.Select(model => model.Id));
        Assert.Contains("image", result.Models.Single(model => model.Id == "vendor/vision-chat").InputModalities);
        Assert.DoesNotContain(result.Models, model => model.Id == "vendor/image-only-chat");
    }

    [Theory]
    [InlineData("embedding", "vendor/embedding")]
    [InlineData("image", "vendor/image-gen")]
    [InlineData("video", "vendor/video")]
    [InlineData("rerank", "vendor/rerank")]
    public async Task GetModelsAsync_NonChatCapabilitiesMatchTheirEndpointType(
        string capability, string expectedId)
    {
        var service = CreateService(_ => JsonResponse(CatalogJson));

        var result = await service.GetModelsAsync("OrcaRouter", capability);

        Assert.Equal([expectedId], result.Models.Select(model => model.Id));
    }

    [Fact]
    public async Task GetModelsAsync_SendsBearerKeyToProviderModelsPath()
    {
        HttpRequestMessage? captured = null;
        var service = CreateService(_ => JsonResponse(CatalogJson), capture: request => captured = request);

        await service.GetModelsAsync("OrcaRouter");

        Assert.NotNull(captured);
        Assert.Equal("api.orcarouter.ai", captured!.RequestUri!.Host);
        Assert.Equal("/v1/models", captured.RequestUri.AbsolutePath);
        Assert.Equal("?capability=chat", captured.RequestUri.Query);
        Assert.Equal("Bearer", captured.Headers.Authorization!.Scheme);
        Assert.Equal("sk-orca-test-not-a-real-key", captured.Headers.Authorization.Parameter);
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.Forbidden)]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.InternalServerError)]
    public async Task GetModelsAsync_OnHttpFailure_ReturnsVerifiedFallback(HttpStatusCode status)
    {
        var service = CreateService(_ => new HttpResponseMessage(status));

        var result = await service.GetModelsAsync("OrcaRouter");

        Assert.True(result.Degraded);
        Assert.Equal("verified-fallback", result.Source);
        Assert.Contains("HTTP", result.Message);
        Assert.Equal(
            ["orcarouter/auto", "openai/gpt-5.5", "orca/orcacyber-ultra-1.0"],
            result.Models.Select(model => model.Id));
        var gpt = result.Models.Single(model => model.Id == "openai/gpt-5.5");
        Assert.Equal(["low", "medium", "high", "xhigh"], gpt.ReasoningEfforts);
    }

    [Fact]
    public async Task GetModelsAsync_OnNetworkFailure_ReturnsVerifiedFallback()
    {
        var service = CreateService(_ => throw new HttpRequestException("connection refused"));

        var result = await service.GetModelsAsync("OrcaRouter");

        Assert.True(result.Degraded);
        Assert.Equal("verified-fallback", result.Source);
        Assert.NotEmpty(result.Models);
    }

    [Fact]
    public async Task GetModelsAsync_OnMalformedCatalog_ReturnsVerifiedFallback()
    {
        var service = CreateService(_ => JsonResponse("<html>not json</html>"));

        var result = await service.GetModelsAsync("OrcaRouter");

        Assert.True(result.Degraded);
        Assert.Contains("invalid catalog response", result.Message);
    }

    [Fact]
    public async Task GetModelsAsync_WithEmptyLiveCatalog_DoesNotMixInFallback()
    {
        var service = CreateService(_ => JsonResponse("""{"object":"list","data":[]}"""));

        var result = await service.GetModelsAsync("OrcaRouter");

        Assert.Equal("live", result.Source);
        Assert.False(result.Degraded);
        Assert.Empty(result.Models);
    }

    [Fact]
    public async Task GetModelsAsync_WithoutApiKey_ThrowsActionableError()
    {
        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["model"] = "orcarouter/auto"
        };
        var service = CreateService(_ => JsonResponse(CatalogJson), values);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.GetModelsAsync("OrcaRouter"));

        Assert.Contains("API key is not configured", exception.Message);
    }

    [Fact]
    public async Task GetModelsAsync_RejectsUnknownCapability()
    {
        var service = CreateService(_ => JsonResponse(CatalogJson));

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => service.GetModelsAsync("OrcaRouter", "telepathy"));

        Assert.Contains("Unsupported model capability", exception.Message);
    }

    [Fact]
    public async Task GetModelsAsync_CapsTheNumberOfCatalogItems()
    {
        var items = string.Join(",", Enumerable.Range(0, 650).Select(index =>
            $$"""{"id":"vendor/model-{{index}}","supported_endpoint_types":["openai"]}"""));
        var service = CreateService(_ => JsonResponse($$"""{"object":"list","data":[{{items}}]}"""));

        var result = await service.GetModelsAsync("OrcaRouter");

        Assert.Equal(500, result.Models.Count);
    }
}

using api_v2.Application.Services;
using api_v2.Common;

namespace Tests.Common;

public class AiChatClientFactoryTests
{
    [Theory]
    [InlineData("ollama")]
    [InlineData("azure-openai")]
    [InlineData("openai-compatible")]
    public async Task CreateAsync_BuildsClientsForEveryAdapter(string adapter)
    {
        var provider = new AiProviderDefinition
        {
            Id = "Test",
            Name = "Test provider",
            Adapter = adapter,
            Endpoint = adapter == "openai-compatible" ? "https://example.com/v1" : null
        };
        var values = adapter switch
        {
            "ollama" => new Dictionary<string, string>
            {
                ["baseUrl"] = "http://localhost:11434/",
                ["model"] = "test-model"
            },
            "azure-openai" => new Dictionary<string, string>
            {
                ["endpoint"] = "https://example.openai.azure.com/",
                ["apiKey"] = "secret",
                ["deployment"] = "test-deployment"
            },
            _ => new Dictionary<string, string>
            {
                ["apiKey"] = "secret",
                ["model"] = "test/model"
            }
        };
        var factory = new AiChatClientFactory(new FakeSettingsService(
            new AiRuntimeSettings(provider, 1234, values)));

        var result = await factory.CreateAsync();

        Assert.NotNull(result.Client);
        Assert.Equal(1234, result.MaxOutputTokens);
    }

    [Fact]
    public async Task CreateAsync_WithMissingRequiredValue_ThrowsHelpfulError()
    {
        var provider = new AiProviderDefinition
        {
            Id = "Router",
            Name = "Router",
            Adapter = "openai-compatible",
            Endpoint = "https://example.com/v1",
            Fields = [new AiProviderFieldDefinition { Key = "apiKey", Label = "API key", Type = "secret" }]
        };
        var factory = new AiChatClientFactory(new FakeSettingsService(
            new AiRuntimeSettings(provider, 4000, new Dictionary<string, string>())));

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => factory.CreateAsync());

        Assert.Equal("Router API key is not configured.", exception.Message);
    }

    private sealed class FakeSettingsService(AiRuntimeSettings settings) : IAiSettingsService
    {
        public Task<AiRuntimeSettings> GetRuntimeSettingsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(settings);

        public Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<AiSettingsResponse> UpdateAsync(
            AiSettingsUpdateRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }
}

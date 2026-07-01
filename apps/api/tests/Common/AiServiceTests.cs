using api_v2.Common;
using api_v2.Application.Services;
using api_v2.Domain.Entities;
using Xunit;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Tests.Common;

public class FakeAiSettingsService : IAiSettingsService
{
    public AiSettings Settings { get; set; } = new();

    public Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new AiSettingsResponse());
    }

    public Task<AiSettingsResponse> UpdateAsync(AiSettingsUpdateRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new AiSettingsResponse());
    }

    public Task<AiSettings> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Settings);
    }
}

public class AiServiceTests
{
    [Fact]
    public async Task GenerateRemediationAsync_WithAzureOpenAiMissingApiKey_ThrowsInvalidOperationException()
    {
        var fakeService = new FakeAiSettingsService();
        fakeService.Settings.Provider = "AzureOpenAI";
        fakeService.Settings.AzureOpenAiEndpoint = "https://example.com";
        fakeService.Settings.AzureOpenAiApiKey = null;

        var aiService = new AiService(fakeService);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => aiService.GenerateRemediationAsync("some vuln"));
        Assert.Equal("Azure OpenAI API Key not configured", exception.Message);
    }

    [Fact]
    public async Task GenerateRemediationAsync_WithAzureOpenAiMissingEndpoint_ThrowsInvalidOperationException()
    {
        var fakeService = new FakeAiSettingsService();
        fakeService.Settings.Provider = "AzureOpenAI";
        fakeService.Settings.AzureOpenAiEndpoint = null;
        fakeService.Settings.AzureOpenAiApiKey = "secret";

        var aiService = new AiService(fakeService);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => aiService.GenerateRemediationAsync("some vuln"));
        Assert.Equal("Azure OpenAI Endpoint not configured", exception.Message);
    }

    [Fact]
    public async Task GenerateRemediationAsync_WithOpenRouterMissingApiKey_ThrowsInvalidOperationException()
    {
        var fakeService = new FakeAiSettingsService();
        fakeService.Settings.Provider = "OpenRouter";
        fakeService.Settings.OpenRouterApiKey = null;

        var aiService = new AiService(fakeService);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => aiService.GenerateRemediationAsync("some vuln"));
        Assert.Equal("OpenRouter API Key not configured", exception.Message);
    }

    [Fact]
    public async Task GenerateRemediationAsync_WithUnknownProvider_ThrowsInvalidOperationException()
    {
        var fakeService = new FakeAiSettingsService();
        fakeService.Settings.Provider = "SomeUnknownProvider";

        var aiService = new AiService(fakeService);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => aiService.GenerateRemediationAsync("some vuln"));
        Assert.Equal("AI provider 'SomeUnknownProvider' is not supported or configured correctly.", exception.Message);
    }
}

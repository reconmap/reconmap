using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Api.Tests.Common;

public class AiUsageRecordingTests
{
    private sealed class FakeRecorder : IAiUsageRecorder
    {
        public List<AiUsage> Rows { get; } = [];

        public Task RecordAsync(AiUsage usage)
        {
            Rows.Add(usage);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeChatClient(Func<ChatResponse> respond) : IChatClient
    {
        public Task<ChatResponse> GetResponseAsync(
            IEnumerable<ChatMessage> messages,
            ChatOptions? options = null,
            CancellationToken cancellationToken = default) => Task.FromResult(respond());

        public IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(
            IEnumerable<ChatMessage> messages,
            ChatOptions? options = null,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public object? GetService(Type serviceType, object? serviceKey = null) => null;

        public void Dispose()
        {
        }
    }

    private static readonly AiUsageTarget Target = new("OpenRouter", "some/model", 3m, 15m);

    [Fact]
    public async Task GetResponseAsync_RecordsTokensCostAndContext()
    {
        var recorder = new FakeRecorder();
        var inner = new FakeChatClient(() => new ChatResponse(new ChatMessage(ChatRole.Assistant, "hi"))
        {
            Usage = new UsageDetails { InputTokenCount = 2000, OutputTokenCount = 1000 }
        });
        var client = new UsageRecordingChatClient(
            inner, recorder, Target, new AiUsageContext(AiFeatures.Triage, 7, 9));

        var response = await client.GetResponseAsync("prompt");

        Assert.Equal("hi", response.Text);
        var row = Assert.Single(recorder.Rows);
        Assert.Equal("OpenRouter", row.Provider);
        Assert.Equal("some/model", row.Model);
        Assert.Equal(AiFeatures.Triage, row.Feature);
        Assert.Equal(7, row.ProjectId);
        Assert.Equal(9, row.UserId);
        Assert.Equal(2000, row.InputTokens);
        Assert.Equal(1000, row.OutputTokens);
        Assert.True(row.Success);
        // 2000 * 3/1M + 1000 * 15/1M
        Assert.Equal(0.021m, row.EstimatedCost);
    }

    [Fact]
    public async Task GetResponseAsync_WithoutUsageDetails_RecordsZeroTokens()
    {
        var recorder = new FakeRecorder();
        var client = new UsageRecordingChatClient(
            new FakeChatClient(() => new ChatResponse(new ChatMessage(ChatRole.Assistant, "hi"))),
            recorder, Target, new AiUsageContext(AiFeatures.Other));

        await client.GetResponseAsync("prompt");

        var row = Assert.Single(recorder.Rows);
        Assert.Equal(0, row.InputTokens);
        Assert.Equal(0m, row.EstimatedCost);
        Assert.Null(row.ProjectId);
    }

    [Fact]
    public async Task GetResponseAsync_WhenInnerFails_RecordsFailureAndRethrows()
    {
        var recorder = new FakeRecorder();
        var client = new UsageRecordingChatClient(
            new FakeChatClient(() => throw new InvalidOperationException("boom")),
            recorder, Target, new AiUsageContext(AiFeatures.Remediation));

        await Assert.ThrowsAsync<InvalidOperationException>(() => client.GetResponseAsync("prompt"));

        var row = Assert.Single(recorder.Rows);
        Assert.False(row.Success);
        Assert.Equal(0m, row.EstimatedCost);
    }

    [Fact]
    public async Task Recorder_PersistsRowsAndSwallowsFailures()
    {
        var dbName = Guid.NewGuid().ToString();
        var services = new ServiceCollection();
        services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase(dbName));
        using var provider = services.BuildServiceProvider();
        var recorder = new AiUsageRecorder(
            provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<AiUsageRecorder>.Instance);

        await recorder.RecordAsync(new AiUsage { CreatedAt = DateTime.UtcNow, Feature = "triage", InputTokens = 5 });

        using var scope = provider.CreateScope();
        Assert.Equal(5, (await scope.ServiceProvider.GetRequiredService<AppDbContext>().AiUsages.SingleAsync()).InputTokens);

        // No AppDbContext registered: must not throw.
        using var empty = new ServiceCollection().BuildServiceProvider();
        var broken = new AiUsageRecorder(
            empty.GetRequiredService<IServiceScopeFactory>(), NullLogger<AiUsageRecorder>.Instance);
        await broken.RecordAsync(new AiUsage());
    }

    [Fact]
    public async Task Factory_WrapsClientOnlyWhenRecorderIsPresent()
    {
        var provider = new AiProviderDefinition { Id = "Ollama", Name = "Ollama", Adapter = "ollama" };
        var values = new Dictionary<string, string>
        {
            ["baseUrl"] = "http://localhost:11434/",
            ["model"] = "llama",
            ["inputPricePerMTok"] = "1.5",
            ["outputPricePerMTok"] = "not-a-number"
        };
        var settings = new StubSettings(new AiRuntimeSettings(provider, 100, values));

        var plain = await new AiChatClientFactory(settings).CreateAsync();
        var wrapped = await new AiChatClientFactory(settings, new FakeRecorder())
            .CreateAsync(new AiUsageContext(AiFeatures.Triage));

        Assert.IsNotType<UsageRecordingChatClient>(plain.Client);
        Assert.IsType<UsageRecordingChatClient>(wrapped.Client);
    }

    private sealed class StubSettings(AiRuntimeSettings settings) : IAiSettingsService
    {
        public Task<AiRuntimeSettings> GetRuntimeSettingsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(settings);

        public Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<AiSettingsResponse> UpdateAsync(
            AiSettingsUpdateRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<AiProviderRuntimeSettings> GetProviderRuntimeSettingsAsync(
            string providerId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(new AiProviderRuntimeSettings(settings.Provider, settings.Values));
    }
}

using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging.Abstractions;
using Reconmap.Api.Application.Commands;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Domain.Entities;

namespace tests.Application.Services;

public class ToolRecommendationServiceTests
{
    private sealed class FailingFactory : IAiChatClientFactory
    {
        public Task<AiChatClientContext> CreateAsync(AiUsageContext? usage = null, CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("AI not configured");
    }

    private sealed class FakeChatClient(string reply) : IChatClient
    {
        public Task<ChatResponse> GetResponseAsync(IEnumerable<ChatMessage> messages, ChatOptions? options = null,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(new ChatResponse(new ChatMessage(ChatRole.Assistant, reply)));

        public IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(IEnumerable<ChatMessage> messages,
            ChatOptions? options = null, CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public object? GetService(Type serviceType, object? serviceKey = null) => null;

        public void Dispose()
        {
        }
    }

    private sealed class FakeFactory(string reply) : IAiChatClientFactory
    {
        public Task<AiChatClientContext> CreateAsync(AiUsageContext? usage = null, CancellationToken cancellationToken = default) =>
            Task.FromResult(new AiChatClientContext(new FakeChatClient(reply), 1000));
    }

    private static ToolRecommendationService RuleBased() =>
        new(new FailingFactory(), NullLogger<ToolRecommendationService>.Instance);

    private static ToolRecommendationRequest Request(string target, string type, string objective) =>
        new() { Target = target, TargetType = type, Objective = objective, ProjectId = TestIds.Of(1) };

    [Fact]
    public async Task RuleBased_WebScan_ForUrl_ResolvesEveryPlaceholder()
    {
        var response = await RuleBased().RecommendToolsAsync(Request("https://example.com/app", "url", ScanObjectives.WebScan));

        Assert.Equal(["shcheck", "testssl", "nmap"], response.Recommendations.Select(r => r.CommandId));
        Assert.All(response.Recommendations, r => Assert.DoesNotContain("{{{", r.Arguments));
        Assert.Equal([1, 2, 3], response.Recommendations.Select(r => r.Order));
        Assert.Contains("-j https://example.com/app", response.Recommendations[0].Arguments);
        // Host-style tools get the host, not the full URL.
        Assert.Equal("-oX - example.com", response.Recommendations[2].Arguments);
        Assert.False(string.IsNullOrWhiteSpace(response.Strategy));
    }

    [Fact]
    public async Task RuleBased_SslCheck_OnlyRunsTestssl()
    {
        var response = await RuleBased().RecommendToolsAsync(Request("example.com", "domain", ScanObjectives.SslTlsCheck));

        var rec = Assert.Single(response.Recommendations);
        Assert.Equal("testssl", rec.CommandId);
        Assert.Equal("testssl", rec.ExecutablePath);
        Assert.EndsWith("example.com", rec.Arguments);
    }

    [Fact]
    public async Task RuleBased_FullRecon_ForDomain_IncludesSubfinderButNoCodeTools()
    {
        var response = await RuleBased().RecommendToolsAsync(Request("example.com", "domain", ScanObjectives.FullReconnaissance));

        var ids = response.Recommendations.Select(r => r.CommandId).ToList();
        Assert.Contains("subfinder", ids);
        Assert.Contains("nmap", ids);
        Assert.DoesNotContain("bandit", ids);
        Assert.Contains("-d example.com", response.Recommendations.First(r => r.CommandId == "subfinder").Arguments);
    }

    [Fact]
    public async Task RuleBased_ObjectiveThatDoesNotFitTarget_ReturnsNothing()
    {
        var response = await RuleBased().RecommendToolsAsync(Request("10.0.0.1", "ip", ScanObjectives.CodeAudit));

        Assert.Empty(response.Recommendations);
        Assert.Contains("No tool", response.Strategy);
    }

    [Fact]
    public async Task Ai_DropsUnknownToolsAndFillsArgumentsItself()
    {
        const string reply = """
            ```json
            {"strategy":"Check TLS then ports","recommendations":[
              {"commandId":"made-up","usageId":"x","rationale":"nope"},
              {"commandId":"testssl","usageId":"testssl-scan","rationale":"Certificate checks"},
              {"commandId":"nmap","usageId":"nmap-tcp-syn","rationale":"Open ports"}]}
            ```
            """;
        var service = new ToolRecommendationService(new FakeFactory(reply), NullLogger<ToolRecommendationService>.Instance);

        var response = await service.RecommendToolsAsync(Request("example.com", "domain", ScanObjectives.WebScan));

        Assert.Equal("Check TLS then ports", response.Strategy);
        Assert.Equal(["testssl", "nmap"], response.Recommendations.Select(r => r.CommandId));
        Assert.Equal("Certificate checks", response.Recommendations[0].Rationale);
        Assert.Equal([1, 2], response.Recommendations.Select(r => r.Order));
        Assert.All(response.Recommendations, r => Assert.DoesNotContain("{{{", r.Arguments));
    }

    [Fact]
    public async Task Ai_WithOnlyInvalidTools_FallsBackToRules()
    {
        const string reply = """{"strategy":"x","recommendations":[{"commandId":"made-up","usageId":"x"}]}""";
        var service = new ToolRecommendationService(new FakeFactory(reply), NullLogger<ToolRecommendationService>.Instance);

        var response = await service.RecommendToolsAsync(Request("example.com", "domain", ScanObjectives.SslTlsCheck));

        Assert.Equal("testssl", Assert.Single(response.Recommendations).CommandId);
    }
}

public class CommandArgumentsTests
{
    [Theory]
    [InlineData("-oX - {{{Host|||localhost}}}", "https://example.com:8443/x", "url", "-oX - example.com")]
    [InlineData("-j {{{URL|||https://localhost}}}", "example.com", "domain", "-j https://example.com")]
    [InlineData("--jsonfile out.json {{{Target}}}", "10.0.0.5", "ip", "--jsonfile out.json 10.0.0.5")]
    [InlineData("-o out.sarif .", "git@github.com:a/b.git", "code_repo", "-o out.sarif .")]
    public void Resolve_ReplacesPlaceholders(string arguments, string target, string type, string expected)
    {
        Assert.Equal(expected, CommandArguments.Resolve(arguments, target, type));
    }

    [Fact]
    public void Resolve_DoesNotFallBackToSampleDefaultForTargetPlaceholders()
    {
        Assert.Null(CommandArguments.Resolve("-j {{{URL|||https://localhost}}}", "git@github.com:a/b.git", "code_repo"));
    }

    [Fact]
    public void Resolve_UsesDefaultForOtherPlaceholders()
    {
        Assert.Equal("--level 3", CommandArguments.Resolve("--level {{{Level|||3}}}", "example.com", "domain"));
    }

    [Fact]
    public void Resolve_ReturnsNullForUnknownPlaceholderWithoutDefault()
    {
        Assert.Null(CommandArguments.Resolve("{{{Input}}}", "example.com", "domain"));
    }
}

public class CommandDiscoveryUsageLookupTests
{
    [Fact]
    public void FindUsageById_SetsOwningCommandId()
    {
        var usage = CommandDiscovery.FindUsageById("nmap-tcp-syn");

        Assert.NotNull(usage);
        Assert.Equal("nmap", usage.CommandId);
        Assert.NotNull(CommandDiscovery.FindById(usage.CommandId));
    }
}

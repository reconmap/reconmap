using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Reconmap.Api.Application.Services;
using Xunit;

namespace tests.Application;

public class McpHealthProbeTests
{
    private sealed class StubHandler(Func<HttpResponseMessage> respond) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
            Task.FromResult(respond());
    }

    private sealed class StubFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler);
    }

    private static McpHealthProbe CreateProbe(string? healthUrl, Func<HttpResponseMessage> respond)
    {
        var settings = new Dictionary<string, string?> { ["Mcp:HealthUrl"] = healthUrl };
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
        return new McpHealthProbe(new StubFactory(new StubHandler(respond)), configuration,
            NullLogger<McpHealthProbe>.Instance);
    }

    [Fact]
    public async Task CheckAsync_WithoutHealthUrl_ReportsNotConfigured()
    {
        var probe = CreateProbe(null, () => new HttpResponseMessage(HttpStatusCode.OK));

        var status = await probe.CheckAsync();

        Assert.False(status.Configured);
        Assert.False(status.Reachable);
        Assert.Null(status.LatencyMs);
    }

    [Fact]
    public async Task CheckAsync_WithHealthyResponse_ReportsReachable()
    {
        var probe = CreateProbe("http://mcp/health", () => new HttpResponseMessage(HttpStatusCode.OK));

        var status = await probe.CheckAsync();

        Assert.True(status.Configured);
        Assert.True(status.Reachable);
        Assert.NotNull(status.LatencyMs);
    }

    [Fact]
    public async Task CheckAsync_WithUnhealthyResponse_ReportsUnreachable()
    {
        var probe = CreateProbe("http://mcp/health", () => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));

        var status = await probe.CheckAsync();

        Assert.True(status.Configured);
        Assert.False(status.Reachable);
    }

    [Fact]
    public async Task CheckAsync_WhenRequestFails_ReportsUnreachable()
    {
        var probe = CreateProbe("http://mcp/health", () => throw new HttpRequestException("connection refused"));

        var status = await probe.CheckAsync();

        Assert.True(status.Configured);
        Assert.False(status.Reachable);
        Assert.Null(status.LatencyMs);
    }
}

using System.Diagnostics;

namespace Reconmap.Api.Application.Services;

public sealed record McpStatus(bool Configured, bool Reachable, long? LatencyMs);

/// <summary>
/// Probes the health endpoint of the separately deployed MCP server (<c>Mcp:HealthUrl</c>).
/// </summary>
public sealed class McpHealthProbe(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<McpHealthProbe> logger)
{
    private static readonly TimeSpan Timeout = TimeSpan.FromSeconds(2);

    public async Task<McpStatus> CheckAsync()
    {
        var healthUrl = configuration["Mcp:HealthUrl"];
        if (string.IsNullOrWhiteSpace(healthUrl))
            return new McpStatus(false, false, null);

        var stopwatch = Stopwatch.StartNew();
        try
        {
            using var cts = new CancellationTokenSource(Timeout);
            var client = httpClientFactory.CreateClient();
            using var response = await client.GetAsync(healthUrl, cts.Token);
            return new McpStatus(true, response.IsSuccessStatusCode, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex) when (ex is HttpRequestException or OperationCanceledException)
        {
            logger.LogWarning(ex, "MCP server health check failed.");
            return new McpStatus(true, false, null);
        }
    }
}

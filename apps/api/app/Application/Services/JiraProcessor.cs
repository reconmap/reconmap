using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using api_v2.Common.Messaging;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

public class JiraProcessor(
    ILogger<JiraProcessor> logger,
    IServiceScopeFactory scopeFactory,
    IMessageQueue messageQueue) : BackgroundService
{
    private readonly HttpClient _httpClient = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Jira processor started, watching 'findings' queue");

        await messageQueue.SubscribeAsync<VulnerabilityJob>("findings", async job =>
        {
            await ProcessFinding(job);
        }, stoppingToken);
    }

    private async Task ProcessFinding(VulnerabilityJob job)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var integrations = await dbContext.JiraIntegrations
            .Where(i => i.IsEnabled)
            .ToListAsync();

        foreach (var integration in integrations)
        {
            await PushToJira(integration, job.Payload);
        }
    }

    private async Task PushToJira(JiraIntegration integration, Vulnerability vulnerability)
    {
        try
        {
            var jiraIssue = new
            {
                fields = new
                {
                    project = new { key = integration.ProjectKey },
                    summary = vulnerability.Summary,
                    description = vulnerability.Description,
                    issuetype = new { name = "Task" } // Or "Bug"
                }
            };

            var jsonPayload = JsonSerializer.Serialize(jiraIssue);
            var request = new HttpRequestMessage(HttpMethod.Post, $"{integration.Url.TrimEnd('/')}/rest/api/2/issue")
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };

            var authString = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{integration.Email}:{integration.ApiToken}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authString);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                logger.LogWarning("Jira push failed for {Url} with status {Status}: {Error}", integration.Url, response.StatusCode, errorContent);
            }
            else
            {
                logger.LogInformation("Finding pushed successfully to Jira at {Url}", integration.Url);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error pushing finding to Jira at {Url}", integration.Url);
        }
    }

    private class VulnerabilityJob
    {
        public string Event { get; set; } = string.Empty;
        public Vulnerability Payload { get; set; } = new();
    }
}

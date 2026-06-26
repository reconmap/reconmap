using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using api_v2.Common.Messaging;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

public class AzureDevopsProcessor(
    ILogger<AzureDevopsProcessor> logger,
    IServiceScopeFactory scopeFactory,
    IMessageQueue messageQueue) : BackgroundService
{
    private readonly HttpClient _httpClient = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Azure DevOps processor started, watching 'findings' queue");

        await messageQueue.SubscribeAsync<VulnerabilityJob>("findings", async job =>
        {
            await ProcessFinding(job);
        }, stoppingToken);
    }

    private async Task ProcessFinding(VulnerabilityJob job)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var integrations = await dbContext.AzureDevopsIntegrations
            .Where(i => i.IsEnabled)
            .ToListAsync();

        foreach (var integration in integrations)
        {
            await PushToAzureDevops(integration, job.Payload);
        }
    }

    private async Task PushToAzureDevops(AzureDevopsIntegration integration, Vulnerability vulnerability)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(integration.Url) ||
                string.IsNullOrWhiteSpace(integration.ProjectName) ||
                string.IsNullOrWhiteSpace(integration.PersonalAccessToken))
            {
                logger.LogWarning(
                    "Azure DevOps integration {IntegrationId} is missing URL, project name, or PAT. Skipping push.",
                    integration.Id);
                return;
            }

            var title = string.IsNullOrWhiteSpace(vulnerability.Summary)
                ? "New vulnerability"
                : vulnerability.Summary.Trim();

            // Azure DevOps title is limited to 255 characters.
            if (title.Length > 255)
            {
                title = title[..255];
            }

            var azureDevopsWorkItem = new List<object>
            {
                new { op = "add", path = "/fields/System.Title", value = title },
                new
                {
                    op = "add",
                    path = "/fields/System.Description",
                    value = string.IsNullOrWhiteSpace(vulnerability.Description) ? "No description" :  vulnerability.Description.Trim()
                }
            };


            var jsonPayload = JsonSerializer.Serialize(azureDevopsWorkItem);
            var projectName = Uri.EscapeDataString(integration.ProjectName.Trim());
            var requestUrl = $"{integration.Url.TrimEnd('/')}/{projectName}/_apis/wit/workitems/$Task?api-version=7.1-preview.3";
            var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json-patch+json")
            };

            var authString = Convert.ToBase64String(Encoding.UTF8.GetBytes($":{integration.PersonalAccessToken}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authString);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                logger.LogWarning("Azure DevOps push failed for {Url} with status {Status}: {Error}", integration.Url, response.StatusCode, errorContent);
            }
            else
            {
                logger.LogInformation("Finding pushed successfully to Azure DevOps at {Url}", integration.Url);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error pushing finding to Azure DevOps at {Url}", integration.Url);
        }
    }

    private class VulnerabilityJob
    {
        public string Event { get; set; } = string.Empty;
        public Vulnerability Payload { get; set; } = new();
    }
}

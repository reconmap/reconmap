using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace api_v2.Application.Services;

public class WebhookJob
{
    public string Event { get; set; } = string.Empty;
    public object Payload { get; set; } = new { };
}

public class WebhookProcessor(
    ILogger<WebhookProcessor> logger,
    IServiceScopeFactory scopeFactory,
    IConnectionMultiplexer redisConnection) : BackgroundService
{
    private readonly string _queueKey = "webhooks:queue";
    private readonly HttpClient _httpClient = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Webhook processor started, watching '{QueueKey}'", _queueKey);
        var redis = redisConnection.GetDatabase();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var item = await redis.ListRightPopAsync(_queueKey);
                if (item.HasValue)
                {
                    var job = JsonSerializer.Deserialize<WebhookJob>(item.ToString(), new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (job != null)
                    {
                        await ProcessWebhookJob(job);
                    }
                }
                else
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing webhook job");
                await Task.Delay(5000, stoppingToken);
            }
        }
    }

    private async Task ProcessWebhookJob(WebhookJob job)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var webhooks = await dbContext.Webhooks
            .Where(w => w.IsEnabled)
            .ToListAsync();

        foreach (var webhook in webhooks)
        {
            var events = webhook.Events.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (events.Contains(job.Event) || events.Contains("*"))
            {
                await DeliverWebhook(webhook, job);
            }
        }
    }

    private async Task DeliverWebhook(Domain.Entities.Webhook webhook, WebhookJob job)
    {
        try
        {
            var jsonPayload = JsonSerializer.Serialize(new
            {
                @event = job.Event,
                timestamp = DateTime.UtcNow,
                payload = job.Payload
            });

            var request = new HttpRequestMessage(HttpMethod.Post, webhook.Url)
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };

            if (!string.IsNullOrEmpty(webhook.Secret))
            {
                var signature = CalculateSignature(webhook.Secret, jsonPayload);
                request.Headers.Add("X-Reconmap-Signature", signature);
            }

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Webhook delivery failed for {Url} with status {Status}", webhook.Url, response.StatusCode);
            }
            else
            {
                logger.LogInformation("Webhook delivered successfully to {Url}", webhook.Url);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error delivering webhook to {Url}", webhook.Url);
        }
    }

    private string CalculateSignature(string secret, string payload)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLower();
    }
}

using System.Net.Http;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Infrastructure.Persistence;
using Xunit.Abstractions;

namespace Api.Tests.Common;

/// <summary>
/// Opt-in test: exercises the real OrcaRouter endpoint through the provider code path that ships to
/// users (settings service -> credential resolution -> chat client factory). It is excluded from the
/// default suite and runs only when the operator exports an OrcaRouter API key.
/// </summary>
[Trait("Category", "Live")]
public class OrcaRouterLiveTests(ITestOutputHelper output)
{
    // Verification-only model for the campaign key. It is deliberately not a user-facing default.
    private const string VerificationModel = "deepseek/deepseek-v4.1-flash";

    private sealed class SimpleHttpClientFactory : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new();
    }

    [Fact]
    public async Task OrcaRouter_ProducesLiveCatalogAndCompletionThroughTheProviderPath()
    {
        var apiKey = Environment.GetEnvironmentVariable("ORCAROUTER_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            output.WriteLine("ORCAROUTER_API_KEY is not set; skipping the live OrcaRouter check.");
            return;
        }

        var configuration = new ConfigurationBuilder()
            .AddJsonFile(Path.Combine(AppContext.BaseDirectory, "ai-providers.json"), optional: false)
            .Build();
        var catalog = new AiProviderCatalog(
            Options.Create(configuration.GetSection("AiProviders").Get<AiProviderCatalogOptions>()!));

        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var db = new AppDbContext(dbOptions);
        var settings = new AiSettingsService(
            db, new EphemeralDataProtectionProvider(), catalog);

        await settings.UpdateAsync(new AiSettingsUpdateRequest
        {
            Provider = "OrcaRouter",
            Settings = new Dictionary<string, string?>
            {
                ["apiKey"] = apiKey,
                ["model"] = VerificationModel
            }
        });

        // 1. Live model discovery through the same service the dashboard endpoint calls.
        var modelCatalog = new AiModelCatalogService(new SimpleHttpClientFactory(), settings);
        var models = await modelCatalog.GetModelsAsync("OrcaRouter", "chat");

        output.WriteLine($"catalog source={models.Source} degraded={models.Degraded} count={models.Models.Count}");
        Assert.Equal("live", models.Source);
        Assert.False(models.Degraded);
        Assert.NotEmpty(models.Models);
        Assert.Contains(models.Models, model => model.Id == VerificationModel);
        Assert.All(models.Models, model => Assert.False(string.IsNullOrWhiteSpace(model.Id)));

        // 2. Inference through the provider adapter, resolved from the stored (encrypted) key.
        var factory = new AiChatClientFactory(settings);
        var context = await factory.CreateAsync();
        var response = await context.Client.GetResponseAsync(
            "Reply with the single word: pong",
            new ChatOptions { MaxOutputTokens = 16 });

        output.WriteLine($"completion length={response.Text?.Length ?? 0}");
        Assert.False(string.IsNullOrWhiteSpace(response.Text));
    }
}

using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

public sealed class AiSettingsResponse
{
    public string Provider { get; set; } = "Ollama";
    public int MaxOutputTokens { get; set; } = 4000;
    public string? OllamaBaseUrl { get; set; }
    public string? OllamaModel { get; set; }
    public string? AzureOpenAiEndpoint { get; set; }
    public bool HasAzureOpenAiApiKey { get; set; }
    public string? AzureOpenAiDeployment { get; set; }
    public bool HasOpenRouterApiKey { get; set; }
    public string? OpenRouterModel { get; set; }
}

public sealed class AiSettingsUpdateRequest
{
    public string? Provider { get; set; }
    public int? MaxOutputTokens { get; set; }
    public string? OllamaBaseUrl { get; set; }
    public string? OllamaModel { get; set; }
    public string? AzureOpenAiEndpoint { get; set; }
    public string? AzureOpenAiApiKey { get; set; }
    public bool ClearAzureOpenAiApiKey { get; set; }
    public string? AzureOpenAiDeployment { get; set; }
    public string? OpenRouterApiKey { get; set; }
    public bool ClearOpenRouterApiKey { get; set; }
    public string? OpenRouterModel { get; set; }
}

public interface IAiSettingsService
{
    Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default);
    Task<AiSettingsResponse> UpdateAsync(AiSettingsUpdateRequest request, CancellationToken cancellationToken = default);
    Task<AiSettings> GetSettingsAsync(CancellationToken cancellationToken = default);
}

public sealed class AiSettingsService(AppDbContext db, IDataProtectionProvider dataProtectionProvider) : IAiSettingsService
{
    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector("ai-settings-api-keys");

    public async Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default)
    {
        var settings = await db.AiSettings
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);

        return ToResponse(settings);
    }

    public async Task<AiSettingsResponse> UpdateAsync(AiSettingsUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await db.AiSettings
            .SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);

        if (settings == null)
        {
            settings = new AiSettings { Id = 1 };
            db.AiSettings.Add(settings);
        }

        if (request.Provider != null) settings.Provider = request.Provider;
        if (request.MaxOutputTokens.HasValue) settings.MaxOutputTokens = request.MaxOutputTokens.Value;
        settings.OllamaBaseUrl = NormalizeText(request.OllamaBaseUrl);
        settings.OllamaModel = NormalizeText(request.OllamaModel);
        settings.AzureOpenAiEndpoint = NormalizeText(request.AzureOpenAiEndpoint);
        settings.AzureOpenAiDeployment = NormalizeText(request.AzureOpenAiDeployment);
        settings.OpenRouterModel = NormalizeText(request.OpenRouterModel);

        if (request.ClearAzureOpenAiApiKey)
            settings.AzureOpenAiApiKey = null;
        else if (!string.IsNullOrWhiteSpace(request.AzureOpenAiApiKey))
            settings.AzureOpenAiApiKey = _protector.Protect(request.AzureOpenAiApiKey.Trim());

        if (request.ClearOpenRouterApiKey)
            settings.OpenRouterApiKey = null;
        else if (!string.IsNullOrWhiteSpace(request.OpenRouterApiKey))
            settings.OpenRouterApiKey = _protector.Protect(request.OpenRouterApiKey.Trim());

        await db.SaveChangesAsync(cancellationToken);

        return ToResponse(settings);
    }

    public async Task<AiSettings> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await db.AiSettings
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);

        if (settings == null)
        {
            return new AiSettings();
        }

        if (!string.IsNullOrWhiteSpace(settings.AzureOpenAiApiKey))
        {
            try
            {
                settings.AzureOpenAiApiKey = _protector.Unprotect(settings.AzureOpenAiApiKey);
            }
            catch
            {
                settings.AzureOpenAiApiKey = null;
            }
        }

        if (!string.IsNullOrWhiteSpace(settings.OpenRouterApiKey))
        {
            try
            {
                settings.OpenRouterApiKey = _protector.Unprotect(settings.OpenRouterApiKey);
            }
            catch
            {
                settings.OpenRouterApiKey = null;
            }
        }

        return settings;
    }

    private static AiSettingsResponse ToResponse(AiSettings? settings)
    {
        return new AiSettingsResponse
        {
            Provider = settings?.Provider ?? "Ollama",
            MaxOutputTokens = settings?.MaxOutputTokens ?? 4000,
            OllamaBaseUrl = settings?.OllamaBaseUrl,
            OllamaModel = settings?.OllamaModel,
            AzureOpenAiEndpoint = settings?.AzureOpenAiEndpoint,
            HasAzureOpenAiApiKey = !string.IsNullOrWhiteSpace(settings?.AzureOpenAiApiKey),
            AzureOpenAiDeployment = settings?.AzureOpenAiDeployment,
            HasOpenRouterApiKey = !string.IsNullOrWhiteSpace(settings?.OpenRouterApiKey),
            OpenRouterModel = settings?.OpenRouterModel
        };
    }

    private static string? NormalizeText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}

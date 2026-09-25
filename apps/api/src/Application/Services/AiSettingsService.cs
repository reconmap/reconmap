using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

public sealed class AiProviderFieldResponse
{
    public required string Key { get; init; }
    public required string Label { get; init; }
    public required string Type { get; init; }
    public bool Required { get; init; }
    public string? DefaultValue { get; init; }
    public string? Placeholder { get; init; }
    public bool HasValue { get; init; }
}

public sealed class AiProviderResponse
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required IReadOnlyList<AiProviderFieldResponse> Fields { get; init; }
}

public sealed class AiSettingsResponse
{
    public required string Provider { get; init; }
    public int MaxOutputTokens { get; init; }
    public required IReadOnlyList<AiProviderResponse> Providers { get; init; }
    public required IReadOnlyDictionary<string, IReadOnlyDictionary<string, string?>> Values { get; init; }
}

public sealed class AiSettingsUpdateRequest
{
    public string? Provider { get; set; }
    public int? MaxOutputTokens { get; set; }
    public Dictionary<string, string?>? Settings { get; set; }
}

public sealed record AiRuntimeSettings(
    AiProviderDefinition Provider,
    int MaxOutputTokens,
    IReadOnlyDictionary<string, string> Values);

public interface IAiSettingsService
{
    Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default);
    Task<AiSettingsResponse> UpdateAsync(AiSettingsUpdateRequest request, CancellationToken cancellationToken = default);
    Task<AiRuntimeSettings> GetRuntimeSettingsAsync(CancellationToken cancellationToken = default);
}

public sealed class AiSettingsService(
    AppDbContext db,
    IDataProtectionProvider dataProtectionProvider,
    IAiProviderCatalog catalog) : IAiSettingsService
{
    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector("ai-settings-api-keys");

    public async Task<AiSettingsResponse> GetAsync(CancellationToken cancellationToken = default)
    {
        var global = await db.AiSettings.AsNoTracking().SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);
        var stored = await db.AiProviderSettings.AsNoTracking().ToListAsync(cancellationToken);
        return BuildResponse(global, stored);
    }

    public async Task<AiSettingsResponse> UpdateAsync(
        AiSettingsUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var global = await db.AiSettings.SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);
        if (global == null)
        {
            global = new AiSettings { Id = 1, Provider = catalog.DefaultProvider };
            db.AiSettings.Add(global);
        }

        var provider = catalog.GetProvider(request.Provider ?? global.Provider);
        if (request.MaxOutputTokens is <= 0)
            throw new ArgumentException("Max output tokens must be greater than zero.", nameof(request));

        global.Provider = provider.Id;
        if (request.MaxOutputTokens.HasValue)
            global.MaxOutputTokens = request.MaxOutputTokens.Value;

        var rows = await db.AiProviderSettings
            .Where(s => s.ProviderId == provider.Id)
            .ToListAsync(cancellationToken);
        var rowsByKey = rows.ToDictionary(s => s.SettingKey, StringComparer.OrdinalIgnoreCase);
        var fieldsByKey = provider.Fields.ToDictionary(f => f.Key, StringComparer.OrdinalIgnoreCase);

        foreach (var (key, submittedValue) in request.Settings ?? [])
        {
            if (!fieldsByKey.TryGetValue(key, out var field))
                throw new ArgumentException($"Setting '{key}' is not defined for AI provider '{provider.Id}'.", nameof(request));

            var value = NormalizeText(submittedValue);
            if (value == null)
            {
                if (rowsByKey.Remove(field.Key, out var existing))
                    db.AiProviderSettings.Remove(existing);
                continue;
            }

            var isSecret = IsSecret(field);
            var storedValue = isSecret ? _protector.Protect(value) : value;
            if (rowsByKey.TryGetValue(field.Key, out var row))
            {
                row.SettingValue = storedValue;
                row.IsSecret = isSecret;
            }
            else
            {
                row = new AiProviderSetting
                {
                    ProviderId = provider.Id,
                    SettingKey = field.Key,
                    SettingValue = storedValue,
                    IsSecret = isSecret
                };
                db.AiProviderSettings.Add(row);
                rowsByKey[field.Key] = row;
            }
        }

        ValidateSettings(provider, rowsByKey);
        await db.SaveChangesAsync(cancellationToken);

        var allRows = await db.AiProviderSettings.AsNoTracking().ToListAsync(cancellationToken);
        return BuildResponse(global, allRows);
    }

    public async Task<AiRuntimeSettings> GetRuntimeSettingsAsync(CancellationToken cancellationToken = default)
    {
        var global = await db.AiSettings.AsNoTracking().SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);
        var provider = catalog.GetProvider(global?.Provider ?? catalog.DefaultProvider);
        var stored = await db.AiProviderSettings.AsNoTracking()
            .Where(s => s.ProviderId == provider.Id)
            .ToDictionaryAsync(s => s.SettingKey, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var field in provider.Fields)
        {
            if (stored.TryGetValue(field.Key, out var row))
                values[field.Key] = IsSecret(field) ? Unprotect(provider, field, row.SettingValue) : row.SettingValue;
            else if (field.DefaultValue != null)
                values[field.Key] = field.DefaultValue;
        }

        ValidateSettings(provider, stored);
        return new AiRuntimeSettings(provider, global?.MaxOutputTokens ?? 4000, values);
    }

    private AiSettingsResponse BuildResponse(AiSettings? global, IReadOnlyCollection<AiProviderSetting> stored)
    {
        var storedByProvider = stored
            .GroupBy(s => s.ProviderId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group.ToDictionary(s => s.SettingKey, StringComparer.OrdinalIgnoreCase),
                StringComparer.OrdinalIgnoreCase);
        var providers = new List<AiProviderResponse>();
        var values = new Dictionary<string, IReadOnlyDictionary<string, string?>>(StringComparer.OrdinalIgnoreCase);

        foreach (var provider in catalog.Providers)
        {
            storedByProvider.TryGetValue(provider.Id, out var providerRows);
            providerRows ??= new Dictionary<string, AiProviderSetting>(StringComparer.OrdinalIgnoreCase);
            var visibleValues = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
            var fields = provider.Fields.Select(field =>
            {
                var hasStoredValue = providerRows.TryGetValue(field.Key, out var row) &&
                                     !string.IsNullOrWhiteSpace(row.SettingValue);
                if (!IsSecret(field))
                    visibleValues[field.Key] = hasStoredValue ? row!.SettingValue : field.DefaultValue;

                return new AiProviderFieldResponse
                {
                    Key = field.Key,
                    Label = field.Label,
                    Type = field.Type,
                    Required = field.Required,
                    DefaultValue = field.DefaultValue,
                    Placeholder = field.Placeholder,
                    HasValue = hasStoredValue
                };
            }).ToList();

            providers.Add(new AiProviderResponse { Id = provider.Id, Name = provider.Name, Fields = fields });
            values[provider.Id] = visibleValues;
        }

        return new AiSettingsResponse
        {
            Provider = global?.Provider ?? catalog.DefaultProvider,
            MaxOutputTokens = global?.MaxOutputTokens ?? 4000,
            Providers = providers,
            Values = values
        };
    }

    private static void ValidateSettings(
        AiProviderDefinition provider,
        IReadOnlyDictionary<string, AiProviderSetting> stored)
    {
        foreach (var field in provider.Fields)
        {
            var value = stored.TryGetValue(field.Key, out var row) ? row.SettingValue : field.DefaultValue;
            if (field.Required && string.IsNullOrWhiteSpace(value))
                throw new InvalidOperationException($"{provider.Name} {field.Label} is not configured.");
            if (field.Type.Equals("url", StringComparison.OrdinalIgnoreCase) &&
                value != null &&
                !Uri.TryCreate(value, UriKind.Absolute, out _))
                throw new InvalidOperationException($"{provider.Name} {field.Label} must be an absolute URL.");
        }
    }

    private string Unprotect(AiProviderDefinition provider, AiProviderFieldDefinition field, string value)
    {
        try
        {
            return _protector.Unprotect(value);
        }
        catch (Exception exception)
        {
            throw new InvalidOperationException($"{provider.Name} {field.Label} could not be decrypted.", exception);
        }
    }

    private static bool IsSecret(AiProviderFieldDefinition field) =>
        field.Type.Equals("secret", StringComparison.OrdinalIgnoreCase);

    private static string? NormalizeText(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

using Microsoft.Extensions.Options;

namespace api_v2.Application.Services;

public sealed class AiProviderCatalogOptions
{
    public string DefaultProvider { get; set; } = "Ollama";
    public List<AiProviderDefinition> Providers { get; set; } = [];
}

public sealed class AiProviderDefinition
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Adapter { get; set; } = string.Empty;
    public string? Endpoint { get; set; }
    public List<AiProviderFieldDefinition> Fields { get; set; } = [];
}

public sealed class AiProviderFieldDefinition
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = "text";
    public bool Required { get; set; }
    public string? DefaultValue { get; set; }
    public string? Placeholder { get; set; }
}

public interface IAiProviderCatalog
{
    string DefaultProvider { get; }
    IReadOnlyList<AiProviderDefinition> Providers { get; }
    AiProviderDefinition GetProvider(string id);
}

public sealed class AiProviderCatalog : IAiProviderCatalog
{
    private static readonly HashSet<string> SupportedAdapters =
        new(StringComparer.OrdinalIgnoreCase) { "ollama", "azure-openai", "openai-compatible" };
    private static readonly HashSet<string> SupportedFieldTypes =
        new(StringComparer.OrdinalIgnoreCase) { "text", "url", "secret" };
    private readonly Dictionary<string, AiProviderDefinition> _providers;

    public AiProviderCatalog(IOptions<AiProviderCatalogOptions> options)
    {
        var configured = options.Value;
        if (configured.Providers.Count == 0)
            throw new InvalidOperationException("At least one AI provider must be configured.");

        _providers = new Dictionary<string, AiProviderDefinition>(StringComparer.OrdinalIgnoreCase);
        foreach (var provider in configured.Providers)
        {
            if (string.IsNullOrWhiteSpace(provider.Id) || string.IsNullOrWhiteSpace(provider.Name))
                throw new InvalidOperationException("Every AI provider requires an id and name.");
            if (!_providers.TryAdd(provider.Id, provider))
                throw new InvalidOperationException($"AI provider id '{provider.Id}' is duplicated.");
            if (!SupportedAdapters.Contains(provider.Adapter))
                throw new InvalidOperationException($"AI provider '{provider.Id}' uses unsupported adapter '{provider.Adapter}'.");
            if (provider.Adapter.Equals("openai-compatible", StringComparison.OrdinalIgnoreCase) &&
                !Uri.TryCreate(provider.Endpoint, UriKind.Absolute, out _))
                throw new InvalidOperationException($"AI provider '{provider.Id}' requires an absolute endpoint.");

            var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var field in provider.Fields)
            {
                if (string.IsNullOrWhiteSpace(field.Key) || string.IsNullOrWhiteSpace(field.Label))
                    throw new InvalidOperationException($"Every field for AI provider '{provider.Id}' requires a key and label.");
                if (!keys.Add(field.Key))
                    throw new InvalidOperationException($"AI provider '{provider.Id}' has duplicate field key '{field.Key}'.");
                if (!SupportedFieldTypes.Contains(field.Type))
                    throw new InvalidOperationException($"AI provider '{provider.Id}' field '{field.Key}' has unsupported type '{field.Type}'.");
                if (field.Type.Equals("secret", StringComparison.OrdinalIgnoreCase) && field.DefaultValue != null)
                    throw new InvalidOperationException($"Secret field '{provider.Id}.{field.Key}' cannot have a default value.");
                if (field.Type.Equals("url", StringComparison.OrdinalIgnoreCase) &&
                    field.DefaultValue != null &&
                    !Uri.TryCreate(field.DefaultValue, UriKind.Absolute, out _))
                    throw new InvalidOperationException(
                        $"AI provider '{provider.Id}' field '{field.Key}' has an invalid default URL.");
            }
        }

        if (!_providers.ContainsKey(configured.DefaultProvider))
            throw new InvalidOperationException($"Default AI provider '{configured.DefaultProvider}' is not configured.");

        DefaultProvider = _providers[configured.DefaultProvider].Id;
        Providers = configured.Providers.AsReadOnly();
    }

    public string DefaultProvider { get; }
    public IReadOnlyList<AiProviderDefinition> Providers { get; }

    public AiProviderDefinition GetProvider(string id) =>
        _providers.TryGetValue(id, out var provider)
            ? provider
            : throw new InvalidOperationException($"AI provider '{id}' is not configured.");
}

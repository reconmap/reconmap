using api_v2.Application.CommandProcessors;

namespace api_v2.Application.Services;

public static class ProcessorIntegrationDiscovery
{
    private static readonly Lazy<IReadOnlyDictionary<string, Type>> ProcessorMap = new(BuildProcessorMap, true);

    public static IEnumerable<IProcessor> Discover(IServiceProvider sp)
    {
        return ProcessorMap.Value.Values
            .Distinct()
            .Select(t => (IProcessor)sp.GetRequiredService(t));
    }

    public static IProcessor Create(IServiceProvider sp, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Processor name must be provided.", nameof(name));

        if (!ProcessorMap.Value.TryGetValue(name, out var type))
            throw new InvalidOperationException($"No processor found with name '{name}'.");

        return (IProcessor)sp.GetRequiredService(type);
    }

    private static IReadOnlyDictionary<string, Type> BuildProcessorMap()
    {
        var processorType = typeof(IProcessor);
        var map = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);

        var types = AppDomain.CurrentDomain
            .GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .Where(t =>
                processorType.IsAssignableFrom(t) &&
                !t.IsAbstract &&
                !t.IsInterface);

        foreach (var type in types)
        {
            var inferredNames = InferNames(type.Name);

            foreach (var name in inferredNames) map[name] = type;
        }

        return map;
    }

    internal static IEnumerable<string> InferNames(string className)
    {
        // Full class name as alias
        yield return className;

        // Remove common suffixes
        var baseName = className;

        if (baseName.EndsWith("Processor", StringComparison.OrdinalIgnoreCase))
            baseName = baseName[..^"Processor".Length];
        else if (baseName.EndsWith("Integration", StringComparison.OrdinalIgnoreCase))
            baseName = baseName[..^"Integration".Length];

        // Full base name supports camelCase lookup via OrdinalIgnoreCase dictionary.
        // e.g. GenericLlmProcessor -> GenericLlm, which matches "genericLlm"
        yield return baseName;

        // First PascalCase segment (e.g. NmapScanProcessor -> Nmap, GenericLlmProcessor -> Generic)
        var firstSegment = new string(
            baseName
                .TakeWhile(c => !char.IsUpper(c) || c == baseName[0])
                .ToArray());

        if (firstSegment != baseName)
            yield return firstSegment;
    }
}

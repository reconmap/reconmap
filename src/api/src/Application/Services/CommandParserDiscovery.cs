using api_v2.Application.CommandParsers;

namespace api_v2.Application.Services;

public static class CommandParserDiscovery
{
    private static readonly Lazy<IReadOnlyDictionary<string, Type>> ParserMap = new(BuildParserMap, true);

    public static IEnumerable<ICommandParser> Discover(IServiceProvider sp)
    {
        return ParserMap.Value.Values
            .Distinct()
            .Select(t => (ICommandParser)sp.GetRequiredService(t));
    }

    public static ICommandParser Create(IServiceProvider sp, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Parser name must be provided.", nameof(name));

        if (!ParserMap.Value.TryGetValue(name, out var type))
            throw new InvalidOperationException($"No parser found with name '{name}'.");

        return (ICommandParser)sp.GetRequiredService(type);
    }

    private static IReadOnlyDictionary<string, Type> BuildParserMap()
    {
        var parserType = typeof(ICommandParser);
        var map = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);

        var types = AppDomain.CurrentDomain
            .GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .Where(t =>
                parserType.IsAssignableFrom(t) &&
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

        if (baseName.EndsWith("Parser", StringComparison.OrdinalIgnoreCase))
            baseName = baseName[..^"Parser".Length];
        else if (baseName.EndsWith("Integration", StringComparison.OrdinalIgnoreCase))
            baseName = baseName[..^"Integration".Length];

        // Full base name supports camelCase lookup via OrdinalIgnoreCase dictionary.
        // e.g. GenericLlmParser -> GenericLlm, which matches "genericLlm"
        yield return baseName;

        // First PascalCase segment (e.g. NmapScanParser -> Nmap, GenericLlmParser -> Generic)
        var firstSegment = new string(
            baseName
                .TakeWhile(c => !char.IsUpper(c) || c == baseName[0])
                .ToArray());

        if (firstSegment != baseName)
            yield return firstSegment;
    }
}

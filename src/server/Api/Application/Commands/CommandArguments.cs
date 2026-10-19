using System.Text.RegularExpressions;

namespace Reconmap.Api.Application.Commands;

/// <summary>
/// Replaces <c>{{{Name|||default}}}</c> placeholders in command usage arguments.
/// </summary>
public static partial class CommandArguments
{
    [GeneratedRegex(@"\{\{\{\s*(?<name>\w+)\s*(?:\|\|\|(?<default>.*?))?\}\}\}")]
    private static partial Regex PlaceholderRegex();

    public static bool HasPlaceholders(string? arguments) =>
        !string.IsNullOrEmpty(arguments) && arguments.Contains("{{{");

    /// <summary>
    /// Returns the arguments with every placeholder replaced, or null when a placeholder
    /// cannot be resolved (it has neither a known value nor a default).
    /// </summary>
    public static string? Resolve(string? arguments, string target, string targetType)
    {
        if (string.IsNullOrEmpty(arguments)) return string.Empty;

        var unresolved = false;
        var resolved = PlaceholderRegex().Replace(arguments, match =>
        {
            var name = match.Groups["name"].Value;
            var value = ValueFor(name, target, targetType);
            if (value != null) return value;

            // Target-like placeholders must never silently fall back to their sample default
            // (e.g. scanning "localhost" instead of the requested target).
            if (!IsTargetPlaceholder(name) && match.Groups["default"].Success)
                return match.Groups["default"].Value;

            unresolved = true;
            return match.Value;
        });

        return unresolved ? null : resolved;
    }

    private static bool IsTargetPlaceholder(string name) =>
        name.ToLowerInvariant() is "url" or "host" or "domain" or "ip" or "target" or "path";

    private static string? ValueFor(string name, string target, string targetType)
    {
        switch (name.ToLowerInvariant())
        {
            case "url":
                if (targetType == "url") return target;
                return targetType is "domain" or "hostname" or "ip" ? "https://" + target : null;
            case "host":
            case "domain":
            case "ip":
                return ExtractHost(target, targetType);
            case "target":
            case "path":
                return target;
            default:
                return null;
        }
    }

    private static string ExtractHost(string target, string targetType)
    {
        if (targetType == "url" && Uri.TryCreate(target, UriKind.Absolute, out var uri))
            return uri.Host;
        return target;
    }
}

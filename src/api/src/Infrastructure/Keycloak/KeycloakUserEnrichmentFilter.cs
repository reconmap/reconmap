using System.Collections;
using System.Reflection;
using api_v2.Domain.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace api_v2.Infrastructure.Keycloak;

/// <summary>
/// Fills in the identity fields (username, email, names, ...) of every user that appears
/// in a response, by walking the returned object graph and looking the users up in Keycloak.
/// </summary>
public sealed class KeycloakUserEnrichmentFilter(IKeycloakUserDirectory directory) : IAsyncResultFilter
{
    private const int MaxDepth = 6;

    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        if (context.Result is ObjectResult { Value: { } value })
        {
            var identities = new List<IKeycloakIdentity>();
            Collect(value, identities, 0, new HashSet<object>(ReferenceEqualityComparer.Instance));

            if (identities.Count > 0)
            {
                var users = await directory.GetManyAsync(identities.Select(i => i.SubjectId).OfType<string>());
                foreach (var identity in identities)
                {
                    if (identity.SubjectId != null && users.TryGetValue(identity.SubjectId, out var user))
                    {
                        identity.ApplyKeycloakUser(user);
                    }
                }
            }
        }

        await next();
    }

    private static void Collect(object? node, List<IKeycloakIdentity> found, int depth, HashSet<object> seen)
    {
        if (node == null || depth > MaxDepth || node is string || node.GetType().IsValueType) return;
        if (!seen.Add(node)) return;

        if (node is IKeycloakIdentity identity)
        {
            found.Add(identity);
            return;
        }

        if (node is IEnumerable items)
        {
            foreach (var item in items) Collect(item, found, depth, seen);
            return;
        }

        // Only walk the API's own types (and anonymous projections), not framework or library types.
        var type = node.GetType();
        if (type.Namespace != null && !type.Namespace.StartsWith("api_v2", StringComparison.Ordinal)) return;

        foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!property.CanRead || property.GetIndexParameters().Length > 0) continue;
            if (property.PropertyType.IsValueType || property.PropertyType == typeof(string)) continue;

            Collect(property.GetValue(node), found, depth + 1, seen);
        }
    }
}

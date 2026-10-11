namespace api_v2.Infrastructure.Keycloak;

/// <summary>
/// Short-lived cache for Keycloak reads. Implementations must not throw when the
/// backing store is unavailable: a cache miss just means Keycloak is queried.
/// </summary>
public interface IKeycloakUserCache
{
    Task<T?> GetAsync<T>(string key) where T : class;

    Task SetAsync<T>(string key, T value, TimeSpan ttl) where T : class;

    Task RemoveAsync(params string[] keys);
}

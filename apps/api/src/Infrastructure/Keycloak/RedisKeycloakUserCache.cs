using System.Text.Json;
using StackExchange.Redis;

namespace api_v2.Infrastructure.Keycloak;

public sealed class RedisKeycloakUserCache(IConnectionMultiplexer redis, ILogger<RedisKeycloakUserCache> logger) : IKeycloakUserCache
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        try
        {
            var value = await redis.GetDatabase().StringGetAsync(key);
            return value.HasValue ? JsonSerializer.Deserialize<T>(value.ToString(), JsonOptions) : null;
        }
        catch (Exception e) when (e is RedisException or JsonException)
        {
            logger.LogWarning(e, "Could not read Keycloak cache key {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl) where T : class
    {
        try
        {
            await redis.GetDatabase().StringSetAsync(key, JsonSerializer.Serialize(value, JsonOptions), ttl);
        }
        catch (RedisException e)
        {
            logger.LogWarning(e, "Could not write Keycloak cache key {Key}", key);
        }
    }

    public async Task RemoveAsync(params string[] keys)
    {
        try
        {
            await redis.GetDatabase().KeyDeleteAsync(keys.Select(k => (RedisKey)k).ToArray());
        }
        catch (RedisException e)
        {
            logger.LogWarning(e, "Could not evict Keycloak cache keys {Keys}", string.Join(", ", keys));
        }
    }
}

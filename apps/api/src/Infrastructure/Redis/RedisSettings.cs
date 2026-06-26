namespace api_v2.Infrastructure.Redis;

public class RedisSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int Database { get; set; }
    public string QueueKey { get; set; } = "my:queue";

    public string ToConnectionString()
    {
        // e.g. "username:password@host:port,defaultDatabase=0"
        var authPart = string.IsNullOrWhiteSpace(User)
            ? $":{Password}@"
            : $"{User}:{Password}@";

        return $"{Host}:{Port},user={User},password={Password}";
    }
}
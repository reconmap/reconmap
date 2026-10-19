namespace Reconmap.Api.Domain.Entities;

public class ToolRecommendationRequest
{
    public string Target { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public string Objective { get; set; } = ScanObjectives.FullReconnaissance;
    public int ProjectId { get; set; }
}

public static class ScanObjectives
{
    public const string FullReconnaissance = "Full reconnaissance";
    public const string WebScan = "Web scan";
    public const string CodeAudit = "Code audit";
    public const string SslTlsCheck = "SSL/TLS check";
}

namespace Reconmap.Api.Domain.Entities;

public class ToolRecommendationRequest
{
    public string Target { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public int ProjectId { get; set; }
}

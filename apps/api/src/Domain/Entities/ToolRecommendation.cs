using System.Collections.Generic;

namespace api_v2.Domain.Entities;

public class ToolRecommendation
{
    public string CommandId { get; set; } = string.Empty;
    public string CommandName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string UsageId { get; set; } = string.Empty;
    public string RecommendedArguments { get; set; } = string.Empty;
    public string Rationale { get; set; } = string.Empty;
}

public class ToolRecommendationResponse
{
    public List<ToolRecommendation> Recommendations { get; set; } = new();
}

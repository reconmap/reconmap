using System.Collections.Generic;

namespace Reconmap.Api.Domain.Entities;

public class ToolRecommendation
{
    public int Order { get; set; }
    public string CommandId { get; set; } = string.Empty;
    public string CommandName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string UsageId { get; set; } = string.Empty;
    public string? ExecutablePath { get; set; }

    /// <summary>
    /// Fully resolved arguments: no <c>{{{placeholders}}}</c> remain.
    /// </summary>
    public string Arguments { get; set; } = string.Empty;
    public string Rationale { get; set; } = string.Empty;
}

public class ToolRecommendationResponse
{
    public string Strategy { get; set; } = string.Empty;
    public List<ToolRecommendation> Recommendations { get; set; } = new();
}

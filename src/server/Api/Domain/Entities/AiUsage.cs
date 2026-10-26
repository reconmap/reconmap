using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

[Table("ai_usage")]
public class AiUsage
{
    [Key] public int Id { get; set; }

    [Column(TypeName = "timestamptz")] public DateTime CreatedAt { get; set; }

    [MaxLength(50)] public string Provider { get; set; } = string.Empty;

    [MaxLength(200)] public string Model { get; set; } = string.Empty;

    [MaxLength(50)] public string Feature { get; set; } = string.Empty;

    public Guid? ProjectId { get; set; }

    public int? UserId { get; set; }

    public long InputTokens { get; set; }

    public long OutputTokens { get; set; }

    public long LatencyMs { get; set; }

    public bool Success { get; set; }

    [Column(TypeName = "numeric(14,6)")] public decimal EstimatedCost { get; set; }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("project")]
public class Project : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    [Column("service_provider_id")] public uint? ServiceProviderId { get; set; }

    [ForeignKey(nameof(ServiceProviderId))] public Organisation? ServiceProvider { get; set; }

    [Column("client_id")] public uint? ClientId { get; set; }

    [ForeignKey(nameof(ClientId))] public Organisation? Client { get; set; }

    [Column("category_id")] public uint? CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))] public ProjectCategory? Category { get; set; }

    [Required]
    [Column("is_template", TypeName = "tinyint(1)")]
    public bool IsTemplate { get; set; }

    [Required] [Column("visibility")] public string Visibility { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    [MaxLength(2000)]
    public string? Description { get; set; }

    [Column("engagement_start_date", TypeName = "date")]
    public DateTime? EngagementStartDate { get; set; }

    [Column("engagement_end_date", TypeName = "date")]
    public DateTime? EngagementEndDate { get; set; }

    [Required]
    [Column("archived", TypeName = "tinyint(1)")]
    public bool Archived { get; set; }

    [Column("archived_at", TypeName = "timestamp")]
    public DateTime? ArchiveAt { get; set; }

    [Column("external_id")]
    [MaxLength(40)]
    public string? ExternalId { get; set; }

    [Column("vulnerability_metrics")] public string? VulnerabilityMetrics { get; set; }
}

public enum Visibility
{
    Public,
    Private
}

public enum VulnerabilityMetrics
{
    CVSS,
    OWASP_RR
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

[Table("finding")]
public class Finding : TimestampedEntity
{
    [Key] public Guid Id { get; set; }

    public int? CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))] public User? CreatedBy { get; private set; }

    [Required] public bool IsTemplate { get; set; }

    [MaxLength(50)]
    public string? ExternalId { get; set; }

    public Guid? ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project? Project { get; set; }

    public Guid? AssetId { get; set; }
    [ForeignKey(nameof(AssetId))] public Asset? Asset { get; set; }


    public int? CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))] public FindingCategory? Category { get; private set; }

    [Required]
    [MaxLength(500)]
    public string Summary { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    [Column(TypeName = "text")]
    public string? ExternalRefs { get; set; }

    [Required] public string? Visibility { get; set; } = "private";

    [Required] public string? Risk { get; set; }

    [Column(TypeName = "text")]
    public string? ProofOfConcept { get; set; }

    [Column(TypeName = "text")] public string? Impact { get; set; }

    [Column(TypeName = "text")]
    public string? Remediation { get; set; }

    public string? RemediationComplexity { get; set; }

    public string? RemediationPriority { get; set; }

    [MaxLength(150)]
    public string? CvssVector { get; set; }

    [Column(TypeName = "decimal(3,1)")]
    public decimal? CvssScore { get; set; }

    [Required] public string Status { get; set; } = "open";

    public string? Substatus { get; set; } = "reported";

    [Column(TypeName = "jsonb")] public string? Tags { get; set; }

    [Column(TypeName = "jsonb")] public string? CustomFields { get; set; }

    [Column("ai_triage", TypeName = "text")]
    public string? AiTriage { get; set; }
}

/*
status	enum('open','confirmed','resolved','closed')	NO		open
substatus	enum('reported','unresolved','unexploited','exploited','remediated','mitigated','rejected')	YES		reported
*/

public enum Risk
{
    none,
    low,
    medium,
    high,
    critical
}

public enum RemediationComplexity
{
    unknown,
    low,
    medium,
    high
}

public enum RemediationPriority
{
    low,
    medium,
    high
}

public enum Substatus
{
    reported,
    unresolved,
    unexploited,
    exploited,
    remediated,
    mitigated,
    rejected
}


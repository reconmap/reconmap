using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("project")]
public class Project : TimestampedEntity
{
    [Key] public int Id { get; set; }

    public int CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    public int? ServiceProviderId { get; set; }

    [ForeignKey(nameof(ServiceProviderId))] public Organisation? ServiceProvider { get; set; }

    public int? ClientId { get; set; }

    [ForeignKey(nameof(ClientId))] public Organisation? Client { get; set; }

    public int? CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))] public ProjectCategory? Category { get; set; }

    [Required]
    [Column(TypeName = "boolean")]
    public bool IsTemplate { get; set; }

    [Required] public string Visibility { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Column(TypeName = "date")]
    public DateTime? EngagementStartDate { get; set; }

    [Column(TypeName = "date")]
    public DateTime? EngagementEndDate { get; set; }

    [Required]
    [Column(TypeName = "boolean")]
    public bool Archived { get; set; }

    [Column(TypeName = "timestamptz")]
    public DateTime? ArchivedAt { get; set; }

    [MaxLength(40)]
    public string? ExternalId { get; set; }

}

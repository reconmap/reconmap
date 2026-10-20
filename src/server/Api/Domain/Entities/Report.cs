using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

[Table("report")]
public class Report : CreationTimestampedEntity
{
    [Key] public int Id { get; set; }

    public int? ProjectId { get; set; }

    public int? CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))] public User? CreatedBy { get; set; }


    public bool IsTemplate { get; set; }

    [Required]
    [MaxLength(50)]
    public string VersionName { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string VersionDescription { get; set; } = string.Empty;
}

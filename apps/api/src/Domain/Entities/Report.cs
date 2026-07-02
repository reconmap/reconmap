using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("report")]
public class Report : CreationTimestampedEntity
{
    [Key] public uint Id { get; set; }

    public uint? ProjectId { get; set; }

    public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public User? CreatedBy { get; set; }


    public bool IsTemplate { get; set; }

    [Required]
    [MaxLength(50)]
    public string VersionName { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string VersionDescription { get; set; } = string.Empty;
}

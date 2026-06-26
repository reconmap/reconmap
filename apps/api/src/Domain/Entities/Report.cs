using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("report")]
public class Report : CreationTimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("project_id")] public uint? ProjectId { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public User? CreatedBy { get; set; }


    [Column("is_template")] public bool IsTemplate { get; set; }

    [Column("version_name")]
    [Required]
    [MaxLength(50)]
    public string VersionName { get; set; } = string.Empty;

    [Column("version_description")]
    [Required]
    [MaxLength(300)]
    public string VersionDescription { get; set; } = string.Empty;
}

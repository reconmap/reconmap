using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("command")]
public class Command : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public User? CreatedBy { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(200)]
    [Column("more_info_url")]
    public string? MoreInfoUrl { get; set; }

    [Column("tags")] public string? Tags { get; set; }
}

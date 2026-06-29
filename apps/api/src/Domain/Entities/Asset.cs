using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("asset")]
public class Asset : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("parent_id")] public uint? ParentId { get; set; }

    [Required] [Column("project_id")] public uint ProjectId { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column("type")] public string? Type { get; set; }

    // JSON column (EF stores as string)
    [Column("tags", TypeName = "json")] public string? Tags { get; set; }
}
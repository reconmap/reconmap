using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("target")]
public class Asset : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("parent_id")] public uint? ParentId { get; set; }

    [Required] [Column("project_id")] public uint ProjectId { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column("kind")] public string? Kind { get; set; }

    // JSON column (EF stores as string)
    [Column("tags", TypeName = "json")] public string? Tags { get; set; }
}
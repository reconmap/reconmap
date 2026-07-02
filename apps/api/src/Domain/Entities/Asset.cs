using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("asset")]
public class Asset : TimestampedEntity
{
    [Key] public uint Id { get; set; }

    public uint? ParentId { get; set; }

    [Required] public uint ProjectId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Type { get; set; }

    // JSON column (EF stores as string)
    [Column(TypeName = "jsonb")] public string? Tags { get; set; }
}
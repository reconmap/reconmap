using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("vault")]
public class Secret : TimestampedEntity
{
    [Key] public uint Id { get; set; }

    [Required] public uint OwnerUid { get; set; }

    public uint? ProjectId { get; set; }

    [Required]
    [Column(TypeName = "varchar")]
    [MaxLength(50)]
    public string Type { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required] public byte[] Value { get; set; } = null!;

    [MaxLength(300)] public string? Url { get; set; }

    [Column(TypeName = "date")]
    public DateTime? ExpirationDate { get; set; }

    [Required]
    [MaxLength(12)]
    public byte[] Iv { get; set; } = null!;

    [Required]
    [MaxLength(16)]
    public byte[] Tag { get; set; } = null!;

    [MaxLength(1000)] public string? Note { get; set; }
}
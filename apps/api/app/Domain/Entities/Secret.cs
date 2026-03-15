using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("vault")]
public class Secret : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Required] [Column("owner_uid")] public uint OwnerUid { get; set; }

    [Column("project_id")] public uint? ProjectId { get; set; }

    [Required]
    [Column("type", TypeName = "enum('password','note','token','key')")]
    public string Type { get; set; } = null!;

    [Required]
    [Column("name")]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required] [Column("value")] public byte[] Value { get; set; } = null!;

    [Column("url")] [MaxLength(300)] public string? Url { get; set; }

    [Column("expiration_date", TypeName = "date")]
    public DateTime? ExpirationDate { get; set; }

    [Required]
    [Column("iv")]
    [MaxLength(12)]
    public byte[] Iv { get; set; } = null!;

    [Required]
    [Column("tag")]
    [MaxLength(16)]
    public byte[] Tag { get; set; } = null!;

    [Column("note")] [MaxLength(1000)] public string? Note { get; set; }
}
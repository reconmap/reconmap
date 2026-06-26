using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("organisation")]
public class Organisation : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    [Column("kind")]
    [Required]
    [MaxLength(20)]
    public string Kind { get; set; }

    [Column("name")]
    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [Column("address")] [MaxLength(400)] public string? Address { get; set; }

    [Column("url")] [MaxLength(255)] public string? Url { get; set; }

    [Column("logo_attachment_id")] public uint? LogoAttachmentId { get; set; }

    [Column("small_logo_attachment_id")] public uint? SmallLogoAttachmentId { get; set; }
}

public enum ClientKind
{
    ServiceProvider,
    Client
}

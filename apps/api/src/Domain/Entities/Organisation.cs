using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("organisation")]
public class Organisation : TimestampedEntity
{
    [Key] public uint Id { get; set; }

    public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    [Required]
    [MaxLength(20)]
    public string Kind { get; set; }

    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(400)] public string? Address { get; set; }

    [MaxLength(255)] public string? Url { get; set; }

    public uint? LogoAttachmentId { get; set; }

    public uint? SmallLogoAttachmentId { get; set; }
}

public enum ClientKind
{
    ServiceProvider,
    Client
}

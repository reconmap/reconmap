using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("attachment")]
public class Attachment : TimestampedEntity
{
    [Key] public uint Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string? ParentType { get; set; }

    public uint ParentId { get; set; }

    public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public User? CreatedBy { get; set; }

    [Required]
    [MaxLength(200)]
    public string ClientFileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string FileName { get; set; } = string.Empty;

    public uint FileSize { get; set; }

    [Column("file_mimetype")]
    [MaxLength(200)]
    public string? FileMimeType { get; set; }

    [Required]
    [MaxLength(10000)]
    public string FileHash { get; set; } = string.Empty;
}

public enum AttachmentParentType
{
    Project,
    Report,
    Command,
    Task,
    Vulnerability,
    Organisation,
    Client
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("attachment")]
public class Attachment : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("parent_type")]
    [Required]
    [MaxLength(20)]
    public string? ParentType { get; set; }

    [Column("parent_id")] public uint ParentId { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public User? CreatedBy { get; set; }

    [Column("client_file_name")]
    [Required]
    [MaxLength(200)]
    public string ClientFileName { get; set; } = string.Empty;

    [Column("file_name")]
    [Required]
    [MaxLength(200)]
    public string FileName { get; set; } = string.Empty;

    [Column("file_size")] public uint FileSize { get; set; }

    [Column("file_mimetype")]
    [MaxLength(200)]
    public string? FileMimeType { get; set; }

    [Column("file_hash")]
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

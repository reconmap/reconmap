using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;

namespace api_v2.Domain.Entities;

public enum DocumentVisibility
{
    Private,
    Public
}

public enum DocumentParentType
{
    Library,
    Project,
    Vulnerability
}

[Table("document")]
public class Document : TimestampedEntity
{
    [Column("id")] public int Id { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }
    
    [ForeignKey(nameof(CreatedByUid))]
    public User? CreatedBy { get; private set; }
    
    [Column("visibility")] public DocumentVisibility Visibility { get; set; } = DocumentVisibility.Private;

    [Column("parent_id")] public int? ParentId { get; set; }
    [Column("parent_type")] public DocumentParentType ParentType { get; set; }

    [Column("content")]
    [Required]
    public string? Content { get; set; }

    [Column("title")] public string? Title { get; set; }
}
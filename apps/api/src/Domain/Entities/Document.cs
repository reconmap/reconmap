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
    public int Id { get; set; }

    public uint CreatedByUid { get; set; }
    
    [ForeignKey(nameof(CreatedByUid))]
    public User? CreatedBy { get; private set; }
    
    public DocumentVisibility Visibility { get; set; } = DocumentVisibility.Private;

    public int? ParentId { get; set; }
    public DocumentParentType ParentType { get; set; }

    [Required]
    public string? Content { get; set; }

    public string? Title { get; set; }
}
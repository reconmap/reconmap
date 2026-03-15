using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("note")]
public class Note : CreationTimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public User? CreatedBy { get; set; }

    [Required] [Column("parent_type")] public string? ParentType { get; set; }

    [Required] [Column("parent_id")] public uint ParentId { get; set; }

    [Required] [Column("visibility")] public string? Visibility { get; set; }

    [Required]
    [Column("content", TypeName = "text")]
    public string Content { get; set; } = string.Empty;
}
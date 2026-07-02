using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("note")]
public class Note : CreationTimestampedEntity
{
    [Key] public uint Id { get; set; }

    public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public User? CreatedBy { get; set; }

    [Required] public string? ParentType { get; set; }

    [Required] public uint ParentId { get; set; }

    [Required] public string? Visibility { get; set; }

    [Required]
    [Column(TypeName = "text")]
    public string Content { get; set; } = string.Empty;
}
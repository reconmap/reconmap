using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

[Table("note")]
public class Note : CreationTimestampedEntity
{
    [Key] public int Id { get; set; }

    public int? CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))] public User? CreatedBy { get; set; }

    [Required] public string? ParentType { get; set; }

    [Required] public int ParentId { get; set; }

    [Required] public string? Visibility { get; set; }

    [Required]
    [Column(TypeName = "text")]
    public string Content { get; set; } = string.Empty;
}
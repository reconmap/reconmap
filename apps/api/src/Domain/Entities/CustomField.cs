using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("custom_field")]
public class CustomField : TimestampedEntity
{
    [Key] public int Id { get; set; }

    [Required]
    [Column(TypeName = "varchar")]
    [MaxLength(50)]
    public string ParentType { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Label { get; set; } = null!;

    [Required]
    [Column(TypeName = "varchar")]
    [MaxLength(50)]
    public string Kind { get; set; } = null!;

    // You can map JSON to string, or to a custom object via value converters
    [Required]
    [Column(TypeName = "jsonb")]
    public string Config { get; set; } = null!;
}
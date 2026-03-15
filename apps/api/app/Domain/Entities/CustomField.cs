using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("custom_field")]
public class CustomField : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Required]
    [Column("parent_type", TypeName = "enum('vulnerability')")]
    public string ParentType { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("label")]
    public string Label { get; set; } = null!;

    [Required]
    [Column("kind", TypeName = "enum('text','integer','decimal')")]
    public string Kind { get; set; } = null!;

    // You can map JSON to string, or to a custom object via value converters
    [Required]
    [Column("config", TypeName = "json")]
    public string Config { get; set; } = null!;
}
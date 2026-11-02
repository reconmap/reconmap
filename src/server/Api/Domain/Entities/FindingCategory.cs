using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Reconmap.Api.Domain.Entities;

[Table("finding_category")]
public class FindingCategory : TimestampedEntity
{
    [Key] public int Id { get; set; }

    public int? ParentId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }


    [JsonIgnore]
    [ForeignKey(nameof(ParentId))]
    public FindingCategory? Parent { get; set; }

    public ICollection<FindingCategory> Children { get; set; } = new List<FindingCategory>();

    [JsonIgnore] public ICollection<Finding> Findings { get; set; } = new List<Finding>();
}

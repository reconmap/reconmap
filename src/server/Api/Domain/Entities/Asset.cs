using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Reconmap.Api.Domain.Entities;

/// <summary>
/// A node in a project's asset tree: a host, a port, a path, a file, a package, or anything else a tool discovers.
/// Structure comes from <see cref="ParentId"/>; <see cref="Kind"/> is a free-form hint, not a closed category.
/// </summary>
[Table("asset")]
public class Asset : TimestampedEntity
{
    [Key] public Guid Id { get; set; }

    public Guid? ParentId { get; set; }

    [Required] public Guid ProjectId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Kind { get; set; }

    /// <summary>What discovered the node (e.g. a parser name), if anything.</summary>
    [MaxLength(100)]
    public string? Source { get; set; }

    public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;

    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

    // JSON columns (EF stores as string)
    [Column(TypeName = "jsonb")] public string? Attributes { get; set; }

    [Column(TypeName = "jsonb")] public string? Tags { get; set; }

    /// <summary>Children found alongside this node by a parser; only used while ingesting, never persisted directly.</summary>
    [NotMapped]
    [JsonIgnore]
    public List<Asset> Children { get; } = new();

    public Asset AddChild(Asset child)
    {
        Children.Add(child);
        return child;
    }
}

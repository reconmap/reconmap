using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

[Table("task")]
public class ProjectTask : TimestampedEntity
{
    [Key] public Guid Id { get; set; }

    [Required] public Guid ProjectId { get; set; }

    public int? CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))] public UserInfo? CreatedBy { get; set; }

    public int? AssignedToId { get; set; }

    [ForeignKey(nameof(AssignedToId))] public UserInfo? AssignedTo { get; set; }

    [Required] public string? Priority { get; set; }

    [Required]
    [MaxLength(200)]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required] public string? Status { get; set; }

    public int? DurationEstimate { get; set; }

    [Column(TypeName = "date")]
    public DateTime? DueDate { get; set; }
}

public enum Priority
{
    highest,
    high,
    medium,
    low,
    lowest
}

public enum Status
{
    todo,
    doing,
    done
}

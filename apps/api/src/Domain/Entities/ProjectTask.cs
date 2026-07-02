using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("task")]
public class ProjectTask : TimestampedEntity
{
    [Key] public uint Id { get; set; }

    [Required] public uint ProjectId { get; set; }

    public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    public uint? AssignedToUid { get; set; }

    [ForeignKey(nameof(AssignedToUid))] public UserInfo? AssignedTo { get; set; }

    [Required] public string? Priority { get; set; }

    [Required]
    [MaxLength(200)]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required] public string? Status { get; set; }

    public ushort? DurationEstimate { get; set; }

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

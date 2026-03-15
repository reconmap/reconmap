using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("task")]
public class ProjectTask : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Required] [Column("project_id")] public uint ProjectId { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    [Column("assigned_to_uid")] public uint? AssignedToUid { get; set; }

    [ForeignKey(nameof(AssignedToUid))] public UserInfo? AssignedTo { get; set; }

    [Required] [Column("priority")] public string? Priority { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("summary")]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(2000)]
    [Column("description")]
    public string? Description { get; set; }

    [Required] [Column("status")] public string? Status { get; set; }

    [Column("duration_estimate")] public ushort? DurationEstimate { get; set; }

    [Column("due_date")] public DateTime? DueDate { get; set; }
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

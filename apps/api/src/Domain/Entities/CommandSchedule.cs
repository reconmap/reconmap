using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("command_schedule")]
public class CommandSchedule : TimestampedEntity
{
    [Key]public uint Id { get; set; }

    public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))]
    public User? CreatedBy { get; set; }

    public string? CommandId { get; set; }

    public string? CommandUsageId { get; set; }

    [NotMapped]
    public Command? Command { get; set; }

    [NotMapped]
    public CommandUsage? CommandUsage { get; set; }

    public uint? ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }

    [MaxLength(1000)]
    public string? ArgumentValues { get; set; }

    [Required]
    [MaxLength(60)]
    public string CronExpression { get; set; } = null!;
}
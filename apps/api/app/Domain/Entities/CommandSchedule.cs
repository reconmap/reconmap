using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("command_schedule")]
public class CommandSchedule : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }
    
    [ForeignKey(nameof(CreatedByUid))]
    public User? CreatedBy { get; set; }

    [Column("command_id")] public uint? CommandId { get; set; }

    [Column("argument_values")]
    [MaxLength(1000)]
    public string? ArgumentValues { get; set; }

    [Column("cron_expression")]
    [Required]
    [MaxLength(60)]
    public string CronExpression { get; set; } = null!;
}
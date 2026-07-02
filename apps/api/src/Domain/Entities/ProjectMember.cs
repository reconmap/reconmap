using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("project_user")]
public class ProjectMember : CreationTimestampedEntity
{
    [Key] public uint Id { get; set; }

    [Required] public uint ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project Project { get; set; } = default!;


    [Required] public uint UserId { get; set; }

    [ForeignKey(nameof(UserId))] public User User { get; set; } = default!;
}
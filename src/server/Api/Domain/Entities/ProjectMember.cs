using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

[Table("project_user")]
public class ProjectMember : CreationTimestampedEntity
{
    [Key] public int Id { get; set; }

    [Required] public Guid ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project Project { get; set; } = default!;


    [Required] public int UserId { get; set; }

    [ForeignKey(nameof(UserId))] public User User { get; set; } = default!;
}
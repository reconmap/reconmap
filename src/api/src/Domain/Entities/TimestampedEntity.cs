using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

public abstract class TimestampedEntity : CreationTimestampedEntity
{
    [Column(TypeName = "timestamptz")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime? UpdatedAt { get; private set; }
}
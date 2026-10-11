using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

public abstract class TimestampedEntity : CreationTimestampedEntity
{
    [Column(TypeName = "timestamptz")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime? UpdatedAt { get; private set; }
}
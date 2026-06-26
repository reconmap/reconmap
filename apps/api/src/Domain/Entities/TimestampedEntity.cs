using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

public abstract class TimestampedEntity : CreationTimestampedEntity
{
    [Column("updated_at", TypeName = "timestamp")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime? UpdatedAt { get; private set; }
}
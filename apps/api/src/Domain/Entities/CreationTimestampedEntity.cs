using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

public abstract class CreationTimestampedEntity
{
    [Column("created_at", TypeName = "timestamp")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime? CreatedAt { get; private set; }
}
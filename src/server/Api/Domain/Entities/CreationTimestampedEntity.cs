using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

public abstract class CreationTimestampedEntity
{
    [Column(TypeName = "timestamptz")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime? CreatedAt { get; private set; }
}
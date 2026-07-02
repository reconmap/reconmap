using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("webhook")]
public class Webhook : TimestampedEntity
{
    public uint Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string? Secret { get; set; }

    public bool IsEnabled { get; set; } = true;

    public string Events { get; set; } = string.Empty;
}

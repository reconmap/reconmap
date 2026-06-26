using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("webhook")]
public class Webhook : TimestampedEntity
{
    [Column("id")]
    public uint Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("url")]
    public string Url { get; set; } = string.Empty;

    [Column("secret")]
    public string? Secret { get; set; }

    [Column("is_enabled")]
    public bool IsEnabled { get; set; } = true;

    [Column("events")]
    public string Events { get; set; } = string.Empty;
}

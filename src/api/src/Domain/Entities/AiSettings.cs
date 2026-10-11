using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Domain.Entities;

[Table("ai_settings")]
public class AiSettings : TimestampedEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; } = 1;

    [MaxLength(50)]
    public string Provider { get; set; } = "Ollama";

    public int MaxOutputTokens { get; set; } = 4000;
}

[Table("ai_provider_settings")]
[PrimaryKey(nameof(ProviderId), nameof(SettingKey))]
public class AiProviderSetting : TimestampedEntity
{
    [MaxLength(50)]
    public required string ProviderId { get; set; }

    [MaxLength(100)]
    public required string SettingKey { get; set; }

    public required string SettingValue { get; set; }

    public bool IsSecret { get; set; }
}

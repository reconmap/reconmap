using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("ai_settings")]
public class AiSettings : TimestampedEntity
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public uint Id { get; set; } = 1;

    [Column("provider")]
    [MaxLength(50)]
    public string Provider { get; set; } = "Ollama";

    [Column("max_output_tokens")]
    public int MaxOutputTokens { get; set; } = 4000;

    [Column("ollama_base_url")]
    [MaxLength(255)]
    public string? OllamaBaseUrl { get; set; }

    [Column("ollama_model")]
    [MaxLength(255)]
    public string? OllamaModel { get; set; }

    [Column("azure_openai_endpoint")]
    [MaxLength(255)]
    public string? AzureOpenAiEndpoint { get; set; }

    [Column("azure_openai_api_key")]
    public string? AzureOpenAiApiKey { get; set; }

    [Column("azure_openai_deployment")]
    [MaxLength(255)]
    public string? AzureOpenAiDeployment { get; set; }

    [Column("openrouter_api_key")]
    public string? OpenRouterApiKey { get; set; }

    [Column("openrouter_model")]
    [MaxLength(255)]
    public string? OpenRouterModel { get; set; }
}

using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("azure_devops_integration")]
public class AzureDevopsIntegration : TimestampedEntity
{
    [Column("id")]
    public uint Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = "Default Azure DevOps Integration";

    [Column("url")]
    public string Url { get; set; } = string.Empty;

    [Column("project_name")]
    public string ProjectName { get; set; } = string.Empty;

    [Column("personal_access_token")]
    public string PersonalAccessToken { get; set; } = string.Empty;

    [Column("is_enabled")]
    public bool IsEnabled { get; set; } = true;
}

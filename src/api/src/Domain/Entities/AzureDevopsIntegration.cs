using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("azure_devops_integration")]
public class AzureDevopsIntegration : TimestampedEntity
{
    public int Id { get; set; }

    public string Name { get; set; } = "Default Azure DevOps Integration";

    public string Url { get; set; } = string.Empty;

    public string ProjectName { get; set; } = string.Empty;

    public string PersonalAccessToken { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = true;
}

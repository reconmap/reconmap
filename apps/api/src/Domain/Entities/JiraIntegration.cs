using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("jira_integration")]
public class JiraIntegration : TimestampedEntity
{
    public uint Id { get; set; }

    public string Name { get; set; } = "Default Jira Integration";

    public string Url { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string ApiToken { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = true;

    public string ProjectKey { get; set; } = string.Empty;
}

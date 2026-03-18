using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("jira_integration")]
public class JiraIntegration : TimestampedEntity
{
    [Column("id")]
    public uint Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = "Default Jira Integration";

    [Column("url")]
    public string Url { get; set; } = string.Empty;

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("api_token")]
    public string ApiToken { get; set; } = string.Empty;

    [Column("is_enabled")]
    public bool IsEnabled { get; set; } = true;

    [Column("project_key")]
    public string ProjectKey { get; set; } = string.Empty;
}

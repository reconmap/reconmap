using System.Text.Json;
using api_v2.Controllers;

namespace tests.Controllers;

public class IntegrationResponseTests
{
    [Fact]
    public void Jira_response_contract_never_contains_api_token()
    {
        var json = JsonSerializer.Serialize(new JiraIntegrationsController.JiraIntegrationResponse(
            1, "Jira", "https://jira.example.invalid", "admin@example.invalid", true, "SEC"));

        Assert.False(json.Contains("ApiToken", StringComparison.OrdinalIgnoreCase));
        Assert.False(json.Contains("secret-token", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Azure_response_contract_never_contains_personal_access_token()
    {
        var json = JsonSerializer.Serialize(new AzureDevopsIntegrationsController.AzureDevopsIntegrationResponse(
            1, "Azure", "https://dev.azure.com/example", "Security", true));

        Assert.False(json.Contains("PersonalAccessToken", StringComparison.OrdinalIgnoreCase));
        Assert.False(json.Contains("secret-token", StringComparison.OrdinalIgnoreCase));
    }
}

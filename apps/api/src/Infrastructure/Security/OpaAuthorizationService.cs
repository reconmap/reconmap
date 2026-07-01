using System.Text;
using System.Text.Json;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;

namespace api_v2.Infrastructure.Security;

public class OpaAuthorizationService(HttpClient httpClient, AppDbContext dbContext, IConfiguration configuration)
{
    public async Task<bool> AuthorizeAsync(User user, string method, string resourceType, object? resourceData = null, List<uint>? memberProjectIds = null)
    {
        var input = new
        {
            input = new
            {
                user = new
                {
                    id = user.Id,
                    role = user.Role.ToString().ToLower(),
                    member_project_ids = memberProjectIds ?? new List<uint>()
                },
                method = method.ToUpper(),
                resource_type = resourceType,
                resource = resourceData ?? new { }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(input), Encoding.UTF8, "application/json");
        var baseUrl = configuration["Opa:ServerUrl"]?.TrimEnd('/') ?? "http://localhost:8181";
        var response = await httpClient.PostAsync($"{baseUrl}/v1/data/reconmap/authz/allow", content);
        
        bool isAllowed = false;
        if (response.IsSuccessStatusCode)
        {
            var resultString = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(resultString);
            
            if (jsonDoc.RootElement.TryGetProperty("result", out var resultElement))
            {
                isAllowed = resultElement.GetBoolean();
            }
        }

        if (!isAllowed)
        {
            // Log audit failure
            dbContext.AuditEntries.Add(new AuditEntry
            {
                Action = "opa_authz_failed",
                Object = resourceType,
                CreatedByUid = user.Id,
                Context = JsonSerializer.Serialize(new { method, resourceType, resourceData }),
                ClientIpBinary = new byte[4] // Placeholder, you might want to inject HttpContext to get real IP
            });
            await dbContext.SaveChangesAsync();
        }

        return isAllowed;
    }
}

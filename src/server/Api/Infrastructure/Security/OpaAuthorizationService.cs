using System.Text;
using System.Text.Json;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Infrastructure.Security;

public class OpaAuthorizationService(HttpClient httpClient, AppDbContext dbContext, IHttpContextAccessor httpContextAccessor)
{
    public async Task<bool> AuthorizeAsync(User user, string method, string resourceType, object? resourceData = null, List<Guid>? memberProjectIds = null)
    {
        var input = new
        {
            input = new
            {
                user = new
                {
                    id = user.Id,
                    role = user.Role.ToString().ToLower(),
                    member_project_ids = memberProjectIds ?? new List<Guid>()
                },
                method = method.ToUpper(),
                resource_type = resourceType,
                resource = resourceData ?? new { }
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(input), Encoding.UTF8, "application/json");
        using var response = await httpClient.PostAsync("v1/data/reconmap/authz/allow", content);
        
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
                CreatedById = user.Id == 0 ? null : user.Id,
                Context = JsonSerializer.Serialize(new { method, resourceType, resourceData }),
                ClientIpBinary = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.GetAddressBytes() ?? new byte[4]
            });
            await dbContext.SaveChangesAsync();
        }

        return isAllowed;
    }
}

using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;

namespace api_v2.Infrastructure.Authentication;

public class RoleClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = principal.Identity as ClaimsIdentity;
        var username = identity?.FindFirst("preferred_username")?.Value;
        // Detect service account
        if (!string.IsNullOrEmpty(username) && username.StartsWith("service-account-"))
        {
            identity?.AddClaim(new Claim(ClaimTypes.Role, "administrator"));
            return Task.FromResult(principal);
        }

        var resourceAccessClaims = identity?.FindFirst("resource_access");
        if (resourceAccessClaims != null)
        {
            var options = new JsonSerializerOptions
                { PropertyNameCaseInsensitive = true }; // Ignore case when deserializing JSON

            // Deserialize the realm_access JSON to extract the roles
            var realmAccess = JsonSerializer.Deserialize<RealmAccess>(resourceAccessClaims.Value, options);

            if (realmAccess?.Dashboard?.Roles != null)
                foreach (var role in realmAccess.Dashboard.Roles)
                    // Add each role as a Claim of type ClaimTypes.Role
                    identity?.AddClaim(new Claim(ClaimTypes.Role, role));
        }

        return Task.FromResult(principal);
    }

    public class Foo
    {
        public List<string>? Roles { get; set; }
    }

    public class RealmAccess
    {
        [JsonPropertyName("dashboard")] public Foo Dashboard { get; set; }
    } // one user can be assigned multiple roles
}

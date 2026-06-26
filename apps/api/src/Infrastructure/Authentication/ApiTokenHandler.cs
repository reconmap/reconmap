using System.Security.Claims;
using System.Text.Encodings.Web;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace api_v2.Infrastructure.Authentication;

public class ApiTokenOptions : AuthenticationSchemeOptions
{
}

public class ApiTokenHandler(
    IOptionsMonitor<ApiTokenOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    AppDbContext dbContext)
    : AuthenticationHandler<ApiTokenOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            return AuthenticateResult.NoResult();
        }

        var authHeaderValue = authHeader.ToString();
        if (!authHeaderValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.NoResult();
        }

        var token = authHeaderValue["Bearer ".Length..].Trim();
        if (string.IsNullOrEmpty(token))
        {
            return AuthenticateResult.NoResult();
        }

        var apiToken = await dbContext.UserApiTokens
            .FirstOrDefaultAsync(t => t.Token == token);

        if (apiToken == null || apiToken.ExpiresAt < DateTime.UtcNow)
        {
            return AuthenticateResult.Fail("Invalid or expired token");
        }

        var user = await dbContext.Users.FindAsync(apiToken.UserId);
        if (user == null)
        {
            return AuthenticateResult.Fail("User not found");
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.SubjectId),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString().ToLower()),
            new("api_token_scope", apiToken.Scope.ToString().ToLower().Replace("_", "-"))
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        // This allows the middleware to pick it up later if needed
        Context.Items["DbUser"] = user;

        return AuthenticateResult.Success(ticket);
    }
}

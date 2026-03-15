using api_v2.Common;
using api_v2.Common.Extensions;
using api_v2.Domain.AuditActions;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace api_v2.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SessionsController(AppDbContext dbContext, IConnectionMultiplexer redis) : AppController(dbContext)
{
    [HttpPost]
    public async Task<OkObjectResult> GetSessions()
    {
        var user = HttpContext.GetCurrentUser();
        var staticToken = new PasswordGenerator().Generate(20);

        redis.GetDatabase().StringSet("static-token", staticToken);
        var cookieOptions = new CookieOptions
        {
            Expires = DateTimeOffset.UtcNow.AddDays(1),
            Path = "/",
            Secure = false,
            HttpOnly = false
        };

        Response.Cookies.Append("reconmap-static", staticToken, cookieOptions);

        await dbContext.UpdateLastLoginAsync(user.Id);

        AuditAction(UserAuditActions.LoggedIn, "User");

        //$user['permissions'] = Permissions::ByRoles[$requestUser->role];
        return Ok(user);
    }

    [HttpDelete]
    public void CloseSession()
    {
        AuditAction(UserAuditActions.LoggedOut, "User");

        Response.Cookies.Delete("reconmap-static");
    }
}

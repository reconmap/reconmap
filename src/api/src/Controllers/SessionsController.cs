using Reconmap.Api.Common;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SessionsController(AppDbContext dbContext, IConnectionMultiplexer redis, IWebHostEnvironment env) : AppController(dbContext)
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
            Secure = !env.IsDevelopment(),
            HttpOnly = false
        };

        Response.Cookies.Append("reconmap-static", staticToken, cookieOptions);

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

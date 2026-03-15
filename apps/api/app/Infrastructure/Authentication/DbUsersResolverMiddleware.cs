using System.Security.Claims;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Infrastructure.Authentication;

public class DbUserResolverMiddleware(RequestDelegate next, ILogger<DbUserResolverMiddleware> logger)
{
    public async Task InvokeAsync(
        HttpContext context,
        AppDbContext db)
    {
        var subjectId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrWhiteSpace(subjectId))
        {
            var user = await db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.SubjectId == subjectId);
            if (user == null) logger.LogWarning("No subject found in db for user {SubjectId}", subjectId);

            context.Items["DbUser"] = user;
        }
        else
        {
            logger.LogWarning("Invalid subject provided {SubjectId}", subjectId);
        }

        await next(context);
    }
}

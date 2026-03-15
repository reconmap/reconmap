using api_v2.Domain.Entities;

namespace api_v2.Common.Extensions;

public static class HttpContextExtensions
{
    public static User? GetCurrentUser(this HttpContext context)
    {
        return context.Items["DbUser"] as User;
    }
}
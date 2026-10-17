using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Common.Extensions;

public static class HttpContextExtensions
{
    public static User? GetCurrentUser(this HttpContext context)
    {
        return context.Items["DbUser"] as User;
    }
}
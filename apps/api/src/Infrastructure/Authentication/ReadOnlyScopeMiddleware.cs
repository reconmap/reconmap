namespace api_v2.Infrastructure.Authentication;

public class ReadOnlyScopeMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var scopeClaim = context.User.FindFirst("api_token_scope");
            if (scopeClaim != null && scopeClaim.Value == "read-only")
            {
                var method = context.Request.Method;
                if (!HttpMethods.IsGet(method) && !HttpMethods.IsHead(method) && !HttpMethods.IsOptions(method))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Token has read-only scope.");
                    return;
                }
            }
        }

        await next(context);
    }
}

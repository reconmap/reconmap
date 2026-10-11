namespace api_v2.Infrastructure.Http;

public class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(
        HttpContext context)
    {
        context.Response.Headers.Add("X-Xss-Protection", "1; mode=block");
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-Permitted-Cross-Domain-Policies", "none");
        context.Response.Headers.Add("Referrer-Policy", "no-referrer");
        context.Response.Headers.Add("Permissions-Policy",
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
        context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'; script-src 'self'; frame-src 'self' http://localhost:5510;");

        await next(context);
    }
}

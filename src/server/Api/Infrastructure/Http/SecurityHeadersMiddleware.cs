namespace Reconmap.Api.Infrastructure.Http;

public class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(
        HttpContext context)
    {
        context.Response.Headers.XXSSProtection = "1; mode=block";
        context.Response.Headers.XContentTypeOptions = "nosniff";
        context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";
        context.Response.Headers["Referrer-Policy"] = "no-referrer";
        context.Response.Headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";
        context.Response.Headers.ContentSecurityPolicy = "default-src 'self'; script-src 'self'; frame-src 'self' http://localhost:5510;";

        await next(context);
    }
}

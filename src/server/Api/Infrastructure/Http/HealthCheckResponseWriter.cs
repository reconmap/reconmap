using System.Text.Json;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Reconmap.Api.Infrastructure.Http;

public static class HealthCheckResponseWriter
{
    public static async Task WriteAsync(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description
            })
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}

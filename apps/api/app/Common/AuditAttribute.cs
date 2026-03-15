using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Common.Extensions;
using api_v2.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace api_v2.Controllers;

[AttributeUsage(AttributeTargets.Method)]
public sealed class AuditAttribute(string action, string entity) : ActionFilterAttribute
{
    public override async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var http = context.HttpContext;

        var remoteIpAddress = http.Connection.RemoteIpAddress?.ToString();
        var userAgent = http.Request.Headers.UserAgent.ToString();

        var resultContext = await next();

        var succeeded =
            resultContext.Exception == null &&
            resultContext.Result is IStatusCodeActionResult { StatusCode: >= 200 and < 300 };

        var data = context.HttpContext.Items["AuditData"];

        var entry = new AuditEntry
        {
            ClientIp = remoteIpAddress,
            UserAgent = userAgent,
            CreatedByUid = http.GetCurrentUser()!.Id,
            Action = action,
            Object = entity,
            Context = data != null ? JsonSerializer.Serialize(data) : null
        };

        var auditService = http.RequestServices
            .GetRequiredService<AuditService>();
        await auditService.RecordAsync(entry);
    }
}

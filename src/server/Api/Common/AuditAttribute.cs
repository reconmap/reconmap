using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace Reconmap.Api.Controllers;

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

        if (!succeeded) return;

        var data = context.HttpContext.Items["AuditData"];

        var entry = new AuditEntry
        {
            ClientIp = remoteIpAddress,
            UserAgent = userAgent,
            CreatedById = http.GetCurrentUser()?.Id,
            Action = action,
            Object = entity,
            Context = data != null ? JsonSerializer.Serialize(data) : null
        };

        var auditService = http.RequestServices
            .GetRequiredService<IAuditService>();
        await auditService.RecordAsync(entry);
    }
}

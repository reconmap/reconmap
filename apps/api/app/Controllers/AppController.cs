using System.Text.Json;
using api_v2.Common.Extensions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace api_v2.Controllers;

public abstract class AppController(AppDbContext dbContext) : ControllerBase
{
    protected void AuditAction(string action, string obj, object? context = null)
    {
        var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;
        var userAgent = Request.Headers.UserAgent.ToString();
        var entry = new AuditEntry
        {
            ClientIp = remoteIpAddress?.ToString(),
            UserAgent = userAgent,
            CreatedByUid = HttpContext.GetCurrentUser()!.Id,
            Action = action,
            Object = obj,
            Context = context != null ? JsonSerializer.Serialize(context) : null
        };
        dbContext.AuditEntries.Add(entry);
        dbContext.SaveChanges();
    }
}

using System.Text.Json;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace Reconmap.Api.Controllers;

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
            CreatedById = HttpContext.GetCurrentUser()!.Id,
            Action = action,
            Object = obj,
            Context = context != null ? JsonSerializer.Serialize(context) : null
        };
        dbContext.AuditEntries.Add(entry);
        dbContext.SaveChanges();
    }
}

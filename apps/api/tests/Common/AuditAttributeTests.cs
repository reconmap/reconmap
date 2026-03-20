using System.Net;
using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace tests.Common;

public class AuditAttributeTests
{
    [Fact]
    public async Task OnActionExecutionAsync_UsesRegisteredAuditInterface()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddScoped<IAuditService, RecordingAuditService>();

        await using var serviceProvider = services.BuildServiceProvider().CreateAsyncScope();

        var httpContext = new DefaultHttpContext
        {
            RequestServices = serviceProvider.ServiceProvider
        };
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse("127.0.0.1");
        httpContext.Request.Headers.UserAgent = "xunit";
        httpContext.Items["DbUser"] = new User { Id = 42 };
        httpContext.Items["AuditData"] = new { ProjectId = 7 };

        var actionContext = new ActionContext(
            httpContext,
            new RouteData(),
            new ActionDescriptor());

        var controller = new object();

        var actionExecutingContext = new ActionExecutingContext(
            actionContext,
            [],
            new Dictionary<string, object?>(),
            controller);

        var attribute = new AuditAttribute("create", "project");

        // Act
        await attribute.OnActionExecutionAsync(actionExecutingContext, () =>
        {
            var executedContext = new ActionExecutedContext(
                actionContext,
                [],
                controller)
            {
                Result = new OkResult()
            };

            return Task.FromResult(executedContext);
        });

        // Assert
        var auditService = serviceProvider.ServiceProvider.GetRequiredService<IAuditService>();
        var recordingAuditService = Assert.IsType<RecordingAuditService>(auditService);
        var entry = Assert.Single(recordingAuditService.Entries);
        Assert.Equal((uint)42, entry.CreatedByUid);
        Assert.Equal("create", entry.Action);
        Assert.Equal("project", entry.Object);
        Assert.Equal("127.0.0.1", entry.ClientIp);
        Assert.Equal("xunit", entry.UserAgent);
        Assert.Equal("""{"ProjectId":7}""", entry.Context);
    }

    private sealed class RecordingAuditService : IAuditService
    {
        public List<AuditEntry> Entries { get; } = [];

        public Task RecordAsync(AuditEntry entry, CancellationToken cancellationToken = default)
        {
            Entries.Add(entry);
            return Task.CompletedTask;
        }
    }
}

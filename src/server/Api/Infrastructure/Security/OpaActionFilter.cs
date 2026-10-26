using System.Text.Json;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Infrastructure.Security;

public class OpaActionFilter(OpaAuthorizationService opaService, AppDbContext dbContext) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.GetCurrentUser();
        var username = context.HttpContext.User.FindFirst("preferred_username")?.Value;
        var isServiceAccount = !string.IsNullOrEmpty(username) && username.StartsWith("service-account-");

        if (user == null)
        {
            if (isServiceAccount)
            {
                // In-memory placeholder for the OPA input only. It is not a database user,
                // so it must never be persisted; audit entries map Id 0 to a NULL actor.
                user = new User
                {
                    Id = 0,
                    Username = username!,
                    Email = string.Empty,
                    FirstName = "Service",
                    LastName = "Account",
                    Role = UserRole.Administrator,
                    Active = true
                };
            }
            else
            {
                context.Result = new UnauthorizedResult();
                return;
            }
        }


        var method = context.HttpContext.Request.Method;
        var controller = context.RouteData.Values["controller"]?.ToString()?.ToLower() ?? "unknown";
        
        // Fetch the user's project memberships to pass to OPA
        var memberProjectIds = await dbContext.ProjectMembers
            .Where(pm => pm.UserId == user.Id)
            .Select(pm => pm.ProjectId)
            .ToListAsync();

        // Extract potential resource IDs from action arguments
        Guid? projectId = null;
        if (context.ActionArguments.TryGetValue("projectId", out var pidObj) && pidObj is Guid pid) projectId = pid;
        object? resourceId = null;
        if (context.ActionArguments.TryGetValue("id", out var idObj) && idObj is int or Guid)
        {
            resourceId = idObj;
            // Try to infer projectId if the resource is a child of project
            if (idObj is Guid id)
            {
                if (controller == "projects") projectId = id;
                else if (controller == "vulnerabilities")
                {
                    projectId = await dbContext.Vulnerabilities.Where(v => v.Id == id).Select(v => v.ProjectId).FirstOrDefaultAsync();
                }
                else if (controller == "tasks")
                {
                    projectId = await dbContext.Tasks.Where(t => t.Id == id).Select(t => (Guid?)t.ProjectId).FirstOrDefaultAsync();
                }
                else if (controller == "reports")
                {
                    projectId = await dbContext.Reports.Where(r => r.Id == id && !r.IsTemplate).Select(r => r.ProjectId).FirstOrDefaultAsync();
                }
            }
            else if (idObj is int assetId && controller == "assets")
            {
                projectId = await dbContext.Assets.Where(a => a.Id == assetId).Select(a => (Guid?)a.ProjectId).FirstOrDefaultAsync();
            }
        }
        else if (context.ActionArguments.Values.FirstOrDefault(v => v is Vulnerability) is Vulnerability v)
        {
            projectId = v.ProjectId;
            resourceId = v.Id;
        }
        else if (context.ActionArguments.Values.FirstOrDefault(v => v is ProjectTask) is ProjectTask t)
        {
            projectId = t.ProjectId;
            resourceId = t.Id;
        }
        else if (context.ActionArguments.Values.FirstOrDefault(v => v is Project) is Project p)
        {
            projectId = p.Id;
            resourceId = p.Id;
        }

        var resourceData = new
        {
            type = controller,
            project_id = projectId,
            id = resourceId
        };

        var isAllowed = await opaService.AuthorizeAsync(user, method, controller, resourceData, memberProjectIds);
        if (!isAllowed)
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}

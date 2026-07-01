using System.Text.Json;
using api_v2.Common.Extensions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Infrastructure.Security;

public class OpaActionFilter(OpaAuthorizationService opaService, AppDbContext dbContext) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.GetCurrentUser();
        if (user == null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var method = context.HttpContext.Request.Method;
        var controller = context.RouteData.Values["controller"]?.ToString()?.ToLower() ?? "unknown";
        
        // Fetch the user's project memberships to pass to OPA
        var memberProjectIds = await dbContext.ProjectMembers
            .Where(pm => pm.UserId == user.Id)
            .Select(pm => pm.ProjectId)
            .ToListAsync();

        // Extract potential resource IDs from action arguments
        uint? projectId = null;
        if (context.ActionArguments.TryGetValue("projectId", out var pidObj) && pidObj is int pid) projectId = (uint)pid;
        uint? resourceId = null;
        if (context.ActionArguments.TryGetValue("id", out var idObj) && idObj is uint id)
        {
            resourceId = id;
            // Try to infer projectId if the resource is a child of project
            if (controller == "projects") projectId = id;
            else if (controller == "vulnerabilities")
            {
                projectId = await dbContext.Vulnerabilities.Where(v => v.Id == id).Select(v => (uint?)v.ProjectId).FirstOrDefaultAsync();
            }
            else if (controller == "tasks")
            {
                projectId = await dbContext.Tasks.Where(t => t.Id == id).Select(t => (uint?)t.ProjectId).FirstOrDefaultAsync();
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

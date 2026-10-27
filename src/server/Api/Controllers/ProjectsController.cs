using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Common.Messaging;
using Reconmap.Api.Domain.AuditActions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Reconmap.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProjectsController(AppDbContext dbContext, IProjectService projectService, IMessageQueue messageQueue, IConnectionMultiplexer redis) : ControllerBase
{
    [HttpPost]
    [Audit(AuditActions.Created, "Project")]
    public async Task<IActionResult> CreateOne([FromBody] Project project)
    {
        project.CreatedById = HttpContext.GetCurrentUser()!.Id;
        dbContext.Projects.Add(project);
        await dbContext.SaveChangesAsync();

        var projectUser = new ProjectMember { ProjectId = project.Id, UserId = project.CreatedById!.Value };
        dbContext.ProjectMembers.Add(projectUser);
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id = project.Id };

        await messageQueue.PublishAsync("webhooks",
            new { @event = "project.created", payload = project });

        return CreatedAtAction(nameof(GetOne), new { id = project.Id }, project);
    }


    [HttpPut("{id:guid}")]
    [Audit(AuditActions.Updated, "Project")]
    public async Task<IActionResult> UpdateOne(Guid id, Project project)
    {
        var dbModel = await dbContext.Projects.FindAsync(id);
        if (dbModel == null) return NotFound();

        dbContext.Entry(dbModel).CurrentValues.SetValues(project);
        dbContext.Entry(dbModel).Property(x => x.Id).IsModified = false;
        await dbContext.SaveChangesAsync();

        HttpContext.Items["AuditData"] = new { id };

        return Ok(dbModel);
    }

    [HttpPatch("{id:guid}")]
    [Audit(AuditActions.Updated, "Project")]
    public async Task<IActionResult> PatchOne(Guid id, [FromBody] JsonElement json)
    {
        var updated = await dbContext.Projects
            .Where(n => n.Id == id)
            .ExecuteUpdateAsync(upd => upd
                .SetProperty(n => n.Archived, json.GetProperty("archived").GetBoolean()));

        if (updated == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetMany(
        [FromQuery] string? status,
        [FromQuery] string? keywords,
        [FromQuery] bool? isTemplate,
        [FromQuery] int? clientId)
    {
        var currentUser = HttpContext.GetCurrentUser()!;

        if (!string.IsNullOrEmpty(keywords))
        {
            var setName = $"recent-searches-user${HttpContext.GetCurrentUser()!.Id}";
            var db = redis.GetDatabase();
            db.SortedSetAdd(setName, keywords, new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds());
        }

        var filter = new ProjectFilter(status, keywords, isTemplate, clientId,
            MemberOfUserId: currentUser.Role == UserRole.Client ? currentUser.Id : null);

        var pagination = new PaginationRequestHandler(HttpContext.Request.Query);
        var page = await projectService.GetManyAsync(filter,
            new Paging(pagination.CalculateOffset(), pagination.GetResultsPerPage()));

        var totalCount = page.TotalCount;
        var results = page.Data;
        var pageCount = new PaginationRequestHandler(HttpContext.Request.Query, totalCount).CalculatePageCount();

        return Ok(new
        {
            pageCount,
            totalCount,
            data = results
        });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetProjectCategories()
    {
        var q = dbContext.ProjectCategories.AsNoTracking()
            .OrderBy(a => a.Name);

        var results = await q.ToListAsync();
        return Ok(results);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var project = await projectService.GetByIdAsync(id);
        if (project == null) return NotFound();

        return Ok(project);
    }

    [HttpDelete("{id:guid}")]
    [Audit(AuditActions.Deleted, "Project")]
    public async Task<IActionResult> DeleteOne(Guid id)
    {
        var deleteCount = await dbContext.Projects
            .Where(n => n.Id == id)
            .ExecuteDeleteAsync();

        if (deleteCount == 0) return NotFound();

        HttpContext.Items["AuditData"] = new { id };

        return NoContent();
    }

    [HttpGet("{projectId:guid}/secrets")]
    public async Task<IActionResult> GetSecrets(Guid projectId)
    {
        var secrets = await dbContext.Secrets
            .AsNoTracking()
            .Where(s => s.ProjectId == projectId)
            .ToListAsync();

        return Ok(secrets);
    }
}

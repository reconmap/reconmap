using Reconmap.Api.Application.Commands;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Controllers;

public class CreateScanRunRequest
{
    public int ProjectId { get; set; }
    public string Target { get; set; } = string.Empty;
    public string TargetType { get; set; } = string.Empty;
    public string Objective { get; set; } = ScanObjectives.FullReconnaissance;
}

public class UpdateScanRunTaskStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Error { get; set; }
}

[Route("api/scans")]
[ApiController]
public class ScanRunsController(AppDbContext dbContext, IToolRecommendationService recommendationService)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] int? projectId, [FromQuery] int limit = 20)
    {
        var query = dbContext.ScanRuns.Include(r => r.Tasks).AsNoTracking();
        if (projectId.HasValue) query = query.Where(r => r.ProjectId == projectId.Value);

        var runs = await query
            .OrderByDescending(r => r.Id)
            .Take(Math.Clamp(limit, 1, 100))
            .ToListAsync();

        runs.ForEach(r => r.Tasks = r.Tasks.OrderBy(t => t.Position).ToList());

        return Ok(runs);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOne(int id)
    {
        var run = await dbContext.ScanRuns.Include(r => r.Tasks).AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        if (run == null) return NotFound();

        run.Tasks = run.Tasks.OrderBy(t => t.Position).ToList();
        return Ok(run);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOne([FromBody] CreateScanRunRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Target)) return BadRequest("A target is required.");
        if (!await dbContext.Projects.AnyAsync(p => p.Id == request.ProjectId)) return BadRequest("Project not found.");

        var target = request.Target.Trim();
        var recommendations = await recommendationService.RecommendToolsAsync(new ToolRecommendationRequest
        {
            Target = target,
            TargetType = request.TargetType,
            Objective = request.Objective,
            ProjectId = request.ProjectId
        });

        if (recommendations.Recommendations.Count == 0)
            return UnprocessableEntity(new { message = recommendations.Strategy });

        var userId = HttpContext.GetCurrentUser()!.Id;
        var run = new ScanRun
        {
            ProjectId = request.ProjectId,
            CreatedById = userId,
            Target = target,
            TargetType = request.TargetType.ToLowerInvariant(),
            Objective = request.Objective,
            Strategy = recommendations.Strategy
        };

        foreach (var rec in recommendations.Recommendations)
        {
            run.Tasks.Add(new ScanRunTask
            {
                Position = rec.Order,
                CommandId = rec.CommandId,
                CommandName = rec.CommandName,
                CommandUsageId = rec.UsageId,
                ExecutablePath = rec.ExecutablePath,
                Arguments = rec.Arguments,
                Rationale = rec.Rationale
            });
        }

        dbContext.ScanRuns.Add(run);
        await dbContext.SaveChangesAsync();

        // The runner picks up "once" schedules; each one points back at its task so it can report progress.
        foreach (var task in run.Tasks)
        {
            dbContext.CommandSchedules.Add(new CommandSchedule
            {
                CreatedById = userId,
                CommandId = task.CommandId,
                CommandUsageId = task.CommandUsageId,
                ProjectId = run.ProjectId,
                ArgumentValues = $"{task.ExecutablePath} {task.Arguments}".Trim(),
                CronExpression = "once",
                ScanRunTaskId = task.Id
            });
        }

        await dbContext.SaveChangesAsync();

        return Created($"/api/scans/{run.Id}", run);
    }

    /// <summary>
    /// Called by the runner as it starts and finishes a scan task.
    /// </summary>
    [HttpPost("tasks/{taskId:int}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int taskId, [FromBody] UpdateScanRunTaskStatusRequest request)
    {
        if (!ScanStatus.TaskStatuses.Contains(request.Status)) return BadRequest("Invalid status.");

        var task = await dbContext.ScanRunTasks.FirstOrDefaultAsync(t => t.Id == taskId);
        if (task == null) return NotFound();

        task.Status = request.Status;
        task.Error = request.Status == ScanStatus.Failed ? request.Error : null;
        if (request.Status == ScanStatus.Running) task.StartedAt = DateTime.UtcNow;
        if (request.Status is ScanStatus.Succeeded or ScanStatus.Failed) task.FinishedAt = DateTime.UtcNow;

        var run = await dbContext.ScanRuns.Include(r => r.Tasks).FirstAsync(r => r.Id == task.ScanRunId);
        run.RecomputeStatus();

        await dbContext.SaveChangesAsync();

        return NoContent();
    }
}

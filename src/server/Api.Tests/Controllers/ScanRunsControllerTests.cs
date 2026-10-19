using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace tests.Controllers;

public class ScanRunsControllerTests
{
    private sealed class StubRecommendations(ToolRecommendationResponse response) : IToolRecommendationService
    {
        public Task<ToolRecommendationResponse> RecommendToolsAsync(ToolRecommendationRequest request) =>
            Task.FromResult(response);
    }

    private static AppDbContext CreateDbContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static ScanRunsController CreateController(AppDbContext db, ToolRecommendationResponse response)
    {
        var controller = new ScanRunsController(db, new StubRecommendations(response))
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };
        controller.HttpContext.Items["DbUser"] = new User { Id = 5 };
        return controller;
    }

    private static ToolRecommendationResponse TwoTools() => new()
    {
        Strategy = "Plan",
        Recommendations =
        [
            new ToolRecommendation { Order = 1, CommandId = "nmap", CommandName = "Nmap", UsageId = "nmap-tcp-syn", ExecutablePath = "nmap", Arguments = "-oX - example.com", Rationale = "ports" },
            new ToolRecommendation { Order = 2, CommandId = "testssl", CommandName = "testssl", UsageId = "testssl-scan", ExecutablePath = "testssl", Arguments = "--jsonfile testssl-output.json example.com", Rationale = "tls" }
        ]
    };

    private static async Task<AppDbContext> DbWithProject()
    {
        var db = CreateDbContext();
        db.Projects.Add(new Project { Id = 1, Name = "P", Visibility = "public" });
        await db.SaveChangesAsync();
        return db;
    }

    private static CreateScanRunRequest NewRequest() =>
        new() { ProjectId = 1, Target = " example.com ", TargetType = "domain", Objective = "Web scan" };

    [Fact]
    public async Task CreateOne_StoresRunTasksAndOnceSchedulesWithRealCommandLines()
    {
        using var db = await DbWithProject();
        var controller = CreateController(db, TwoTools());

        var result = await controller.CreateOne(NewRequest());

        Assert.IsType<CreatedResult>(result);
        var run = await db.ScanRuns.Include(r => r.Tasks).SingleAsync();
        Assert.Equal("example.com", run.Target);
        Assert.Equal(5, run.CreatedByUid);
        Assert.Equal(2, run.Tasks.Count);

        var schedules = await db.CommandSchedules.OrderBy(s => s.ScanRunTaskId).ToListAsync();
        Assert.Equal(2, schedules.Count);
        Assert.All(schedules, s => Assert.Equal("once", s.CronExpression));
        Assert.All(schedules, s => Assert.Equal(1, s.ProjectId));
        Assert.Equal("nmap -oX - example.com", schedules[0].ArgumentValues);
        Assert.Equal("nmap-tcp-syn", schedules[0].CommandUsageId);
        Assert.Equal(run.Tasks.Select(t => (int?)t.Id).Order(), schedules.Select(s => s.ScanRunTaskId));
    }

    [Fact]
    public async Task CreateOne_WithNoApplicableTools_ReturnsUnprocessableAndStoresNothing()
    {
        using var db = await DbWithProject();
        var controller = CreateController(db, new ToolRecommendationResponse { Strategy = "No tool fits" });

        var result = await controller.CreateOne(NewRequest());

        Assert.IsType<UnprocessableEntityObjectResult>(result);
        Assert.Empty(db.ScanRuns);
        Assert.Empty(db.CommandSchedules);
    }

    [Fact]
    public async Task CreateOne_RejectsUnknownProject()
    {
        using var db = CreateDbContext();
        var controller = CreateController(db, TwoTools());

        Assert.IsType<BadRequestObjectResult>(await controller.CreateOne(NewRequest()));
    }

    [Fact]
    public async Task UpdateTaskStatus_DerivesRunStatusFromTasks()
    {
        using var db = await DbWithProject();
        var controller = CreateController(db, TwoTools());
        await controller.CreateOne(NewRequest());
        var tasks = await db.ScanRunTasks.OrderBy(t => t.Position).ToListAsync();

        await controller.UpdateTaskStatus(tasks[0].Id, new UpdateScanRunTaskStatusRequest { Status = "running" });
        Assert.Equal("running", (await db.ScanRuns.SingleAsync()).Status);

        await controller.UpdateTaskStatus(tasks[0].Id, new UpdateScanRunTaskStatusRequest { Status = "succeeded" });
        Assert.Equal("running", (await db.ScanRuns.SingleAsync()).Status);

        await controller.UpdateTaskStatus(tasks[1].Id, new UpdateScanRunTaskStatusRequest { Status = "failed", Error = "exec: not found" });
        var run = await db.ScanRuns.Include(r => r.Tasks).SingleAsync();
        Assert.Equal("partial", run.Status);
        Assert.Equal("exec: not found", run.Tasks.Single(t => t.Id == tasks[1].Id).Error);
        Assert.NotNull(run.Tasks.Single(t => t.Id == tasks[1].Id).FinishedAt);
    }

    [Fact]
    public async Task UpdateTaskStatus_RejectsInvalidStatusAndUnknownTask()
    {
        using var db = await DbWithProject();
        var controller = CreateController(db, TwoTools());

        Assert.IsType<BadRequestObjectResult>(await controller.UpdateTaskStatus(1, new UpdateScanRunTaskStatusRequest { Status = "bogus" }));
        Assert.IsType<NotFoundResult>(await controller.UpdateTaskStatus(99, new UpdateScanRunTaskStatusRequest { Status = "running" }));
    }

    [Fact]
    public async Task GetMany_ReturnsNewestFirstFilteredByProject()
    {
        using var db = await DbWithProject();
        db.Projects.Add(new Project { Id = 2, Name = "Q", Visibility = "public" });
        db.ScanRuns.AddRange(
            new ScanRun { ProjectId = 1, Target = "a", Objective = "o" },
            new ScanRun { ProjectId = 2, Target = "b", Objective = "o" },
            new ScanRun { ProjectId = 1, Target = "c", Objective = "o" });
        await db.SaveChangesAsync();
        var controller = CreateController(db, TwoTools());

        var ok = Assert.IsType<OkObjectResult>(await controller.GetMany(1));

        Assert.Equal(["c", "a"], Assert.IsAssignableFrom<IEnumerable<ScanRun>>(ok.Value).Select(r => r.Target));
    }
}

using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace tests.Controllers;

public class TasksControllerTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetMany_FiltersTasksByKeywordsInSummaryOrDescription()
    {
        using var db = CreateDbContext();
        db.Tasks.AddRange(
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "Scan Internal Network", Priority = "high", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "Write report", Description = "Include the NETWORK findings", Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "Review scope", Priority = "low", Status = "done" }
        );
        await db.SaveChangesAsync();

        var controller = new TasksController(db, new TaskService(db));

        var result = await controller.GetMany(null, null, null, null, "network");

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<ProjectTask>>(ok.Value).ToList();
        Assert.Equal(2, tasks.Count);
        Assert.All(tasks, t => Assert.Contains("network", (t.Summary + " " + t.Description).ToLower()));
    }

    [Fact]
    public async Task GetMany_ReturnsAllTasksWhenKeywordsAreMissing()
    {
        using var db = CreateDbContext();
        db.Tasks.AddRange(
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "A", Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "B", Priority = "low", Status = "todo" }
        );
        await db.SaveChangesAsync();

        var controller = new TasksController(db, new TaskService(db));

        var result = await controller.GetMany(null, null, null, null, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(2, Assert.IsAssignableFrom<IEnumerable<ProjectTask>>(ok.Value).Count());
    }

    [Fact]
    public async Task GetMany_FiltersTasksByAssignee()
    {
        using var db = CreateDbContext();
        db.Tasks.AddRange(
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "Mine", AssignedToId = 7, Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "Theirs", AssignedToId = 8, Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "Unassigned", Priority = "low", Status = "todo" }
        );
        await db.SaveChangesAsync();

        var controller = new TasksController(db, new TaskService(db));

        var result = await controller.GetMany(null, null, null, null, null, assignedToId: 7);

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<ProjectTask>>(ok.Value).ToList();
        var task = Assert.Single(tasks);
        Assert.Equal("Mine", task.Summary);
    }

    [Fact]
    public async Task GetMany_ExcludesTasksFromArchivedProjectsWhenProjectIsArchivedIsZero()
    {
        using var db = CreateDbContext();
        db.Projects.AddRange(
            new Project { Id = TestIds.Of(1), Name = "Active", Archived = false },
            new Project { Id = TestIds.Of(2), Name = "Archived", Archived = true }
        );
        db.Tasks.AddRange(
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "Active task", Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(2), Summary = "Archived task", Priority = "low", Status = "todo" }
        );
        await db.SaveChangesAsync();

        var controller = new TasksController(db, new TaskService(db));

        var result = await controller.GetMany(null, null, null, null, null, projectIsArchived: 0);

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<ProjectTask>>(ok.Value).ToList();
        var task = Assert.Single(tasks);
        Assert.Equal("Active task", task.Summary);
    }

    [Fact]
    public async Task GetMany_LimitsNumberOfTasksReturned()
    {
        using var db = CreateDbContext();
        db.Tasks.AddRange(
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "A", Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "B", Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = TestIds.Of(1), Summary = "C", Priority = "low", Status = "todo" }
        );
        await db.SaveChangesAsync();

        var controller = new TasksController(db, new TaskService(db));

        var result = await controller.GetMany(2, null, null, null, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(2, Assert.IsAssignableFrom<IEnumerable<ProjectTask>>(ok.Value).Count());
    }
}

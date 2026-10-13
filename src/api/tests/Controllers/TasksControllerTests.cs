using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
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
            new ProjectTask { ProjectId = 1, Summary = "Scan Internal Network", Priority = "high", Status = "todo" },
            new ProjectTask { ProjectId = 1, Summary = "Write report", Description = "Include the NETWORK findings", Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = 1, Summary = "Review scope", Priority = "low", Status = "done" }
        );
        await db.SaveChangesAsync();

        var controller = new TasksController(db);

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
            new ProjectTask { ProjectId = 1, Summary = "A", Priority = "low", Status = "todo" },
            new ProjectTask { ProjectId = 1, Summary = "B", Priority = "low", Status = "todo" }
        );
        await db.SaveChangesAsync();

        var controller = new TasksController(db);

        var result = await controller.GetMany(null, null, null, null, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(2, Assert.IsAssignableFrom<IEnumerable<ProjectTask>>(ok.Value).Count());
    }
}

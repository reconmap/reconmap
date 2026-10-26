using Reconmap.Api.Application.Services;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace tests.Application.Services;

public class ProjectServiceTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetManyAsync_CountsAllAndCompletedTasksPerProject()
    {
        using var db = CreateDbContext();
        db.Projects.AddRange(
            new Project { Id = TestIds.Of(1), Name = "With tasks" },
            new Project { Id = TestIds.Of(2), Name = "No tasks" });
        db.Tasks.AddRange(
            new ProjectTask { Id = TestIds.Of(1), ProjectId = TestIds.Of(1), Summary = "a", Priority = "low", Status = "done" },
            new ProjectTask { Id = TestIds.Of(2), ProjectId = TestIds.Of(1), Summary = "b", Priority = "low", Status = "todo" },
            new ProjectTask { Id = TestIds.Of(3), ProjectId = TestIds.Of(1), Summary = "c", Priority = "low", Status = "done" });
        await db.SaveChangesAsync();

        var service = new ProjectService(db);
        var result = await service.GetManyAsync(new ProjectFilter(), new Paging(0, 10));

        var withTasks = result.Data.Single(p => p.Id == TestIds.Of(1));
        Assert.Equal(3, withTasks.NumTasks);
        Assert.Equal(2, withTasks.NumCompletedTasks);

        var noTasks = result.Data.Single(p => p.Id == TestIds.Of(2));
        Assert.Equal(0, noTasks.NumTasks);
        Assert.Equal(0, noTasks.NumCompletedTasks);
    }
}

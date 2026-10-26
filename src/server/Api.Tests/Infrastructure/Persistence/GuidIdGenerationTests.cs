using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace tests.Infrastructure.Persistence;

public class GuidIdGenerationTests
{
    private static AppDbContext CreateDbContext() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    [Fact]
    public async Task Projects_tasks_and_reports_get_time_ordered_v7_ids()
    {
        using var db = CreateDbContext();
        var project = new Project { Name = "P" };
        var report = new Report { VersionName = "1.0", VersionDescription = "d" };
        db.Projects.Add(project);
        db.Reports.Add(report);
        await db.SaveChangesAsync();
        var task = new ProjectTask { ProjectId = project.Id, Summary = "T", Priority = "low", Status = "todo" };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        Assert.Equal(7, project.Id.Version);
        Assert.Equal(7, task.Id.Version);
        Assert.Equal(7, report.Id.Version);
    }

    [Fact]
    public async Task Vulnerabilities_get_random_v4_ids_that_carry_no_creation_time()
    {
        using var db = CreateDbContext();
        var first = new Vulnerability { Summary = "A", Risk = "low" };
        var second = new Vulnerability { Summary = "B", Risk = "low" };
        db.Vulnerabilities.AddRange(first, second);
        await db.SaveChangesAsync();

        Assert.Equal(4, first.Id.Version);
        Assert.Equal(4, second.Id.Version);
        Assert.NotEqual(first.Id, second.Id);
    }
}

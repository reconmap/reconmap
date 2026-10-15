using System.Text.Json;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace tests.Controllers;

public class TasksControllerUpdateAssigneeTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task UpdateOne_ClearsAssigneeWhenBodySendsNullAssignedToUid()
    {
        using var db = CreateDbContext();
        db.Tasks.Add(new ProjectTask { Id = 1, ProjectId = 1, CreatedByUid = 1, Summary = "Assigned", Priority = "low", Status = "todo", AssignedToUid = 7 });
        await db.SaveChangesAsync();

        // Shaped like the body the task details page sends: the full task, with a nested assignedTo object.
        const string body = """
            {
              "id": 1, "projectId": 1, "createdByUid": 1, "assignedToUid": null,
              "assignedTo": { "id": 7, "fullName": "Someone" },
              "priority": "low", "summary": "Assigned", "status": "todo"
            }
            """;
        var requestModel = JsonSerializer.Deserialize<ProjectTask>(body, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;

        var controller = new TasksController(db)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };
        var result = await controller.UpdateOne(1, requestModel);

        Assert.IsType<OkObjectResult>(result);
        var stored = await db.Tasks.AsNoTracking().SingleAsync(t => t.Id == 1);
        Assert.Null(stored.AssignedToUid);
    }
}

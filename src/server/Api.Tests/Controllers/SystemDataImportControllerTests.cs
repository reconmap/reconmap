using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Reconmap.Api.Controllers;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace tests.Controllers;

public class SystemDataImportControllerTests
{
    private static AppDbContext CreateDbContext(string databaseName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: databaseName ?? Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static IFormFile CreateJsonFile(string json)
    {
        var bytes = Encoding.UTF8.GetBytes(json);
        return new FormFile(new MemoryStream(bytes), 0, bytes.Length, "importFile", "demo.json")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/json"
        };
    }

    [Fact]
    public async Task ImportData_ImportsRunnersScansAndNestedScanTasks()
    {
        using var db = CreateDbContext();
        var controller = new SystemDataImportController(db);

        var json = """
        {
          "runners": [
            { "Id": 1000, "Name": "runner-eu-west-1", "ClientId": "client-1", "Active": true, "Os": "Ubuntu 24.04 LTS" }
          ],
          "scan_runs": [
            {
              "Id": 1000,
              "ProjectId": "018f0000-0000-7000-8000-000000001000",
              "Target": "app.example.com",
              "TargetType": "hostname",
              "Objective": "Discover attack surface",
              "Status": "succeeded",
              "Tasks": [
                {
                  "Id": 1000,
                  "ScanRunId": 1000,
                  "Position": 0,
                  "CommandId": "subfinder",
                  "CommandName": "Subfinder",
                  "CommandUsageId": "subfinder-subdomains",
                  "Status": "succeeded"
                }
              ]
            }
          ]
        }
        """;

        var result = await controller.ImportData(CreateJsonFile(json), CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(1, await db.Runners.CountAsync());
        Assert.Equal(1, await db.ScanRuns.CountAsync());
        Assert.Equal(1, await db.ScanRunTasks.CountAsync());
    }

    [Fact]
    public async Task ImportData_ImportsCommentsMembersNotificationsWebhooksAndSchedules()
    {
        using var db = CreateDbContext();
        var controller = new SystemDataImportController(db);

        var json = """
        {
          "project_members": [{ "Id": 1000, "ProjectId": "018f0000-0000-7000-8000-000000001000", "UserId": 1000 }],
          "comments": [{ "Id": 1000, "CreatedById": 1000, "ParentType": "project", "ParentId": "018f0000-0000-7000-8000-000000001000", "Content": "Kickoff done." }],
          "notifications": [{ "Id": 1000, "ToUserId": 1000, "Title": "Scan completed", "Content": "Done.", "Status": "unread" }],
          "webhooks": [{ "Id": 1000, "Name": "Chat", "Url": "https://hooks.example.com/x", "IsEnabled": true, "Events": "project.created" }],
          "command_schedules": [{ "Id": 1000, "ProjectId": "018f0000-0000-7000-8000-000000001000", "CommandId": "nmap", "CommandUsageId": "nmap-tcp-syn", "CronExpression": "0 2 * * 1" }],
          "reports": [{ "Id": "018f0000-0000-7000-8000-000000002000", "ProjectId": "018f0000-0000-7000-8000-000000001000", "IsTemplate": false, "VersionName": "Final", "VersionDescription": "Final report" }]
        }
        """;

        var result = await controller.ImportData(CreateJsonFile(json), CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(1, await db.ProjectMembers.CountAsync());
        Assert.Equal(1, await db.Comments.CountAsync());
        Assert.Equal(1, await db.Notifications.CountAsync());
        Assert.Equal(1, await db.Webhooks.CountAsync());
        Assert.Equal(1, await db.CommandSchedules.CountAsync());
        Assert.Equal(1, await db.Reports.CountAsync());
    }

    [Fact]
    public async Task ImportData_KeepsImportingAfterAFailedSave()
    {
        var databaseName = Guid.NewGuid().ToString();

        using (var firstDb = CreateDbContext(databaseName))
        {
            var firstImport = new SystemDataImportController(firstDb);
            await firstImport.ImportData(
                CreateJsonFile("""{ "runners": [{ "Id": 1000, "Name": "runner-1", "ClientId": "client-1" }] }"""),
                CancellationToken.None);
        }

        using var db = CreateDbContext(databaseName);
        var controller = new SystemDataImportController(db);

        // The runner id is already stored, so its save fails. The comment after it must still be imported.
        var json = """
        {
          "runners": [{ "Id": 1000, "Name": "runner-2", "ClientId": "client-2" }],
          "comments": [{ "Id": 1000, "CreatedById": 1, "ParentType": "project", "ParentId": "018f0000-0000-7000-8000-000000000001", "Content": "Still imported." }]
        }
        """;

        await controller.ImportData(CreateJsonFile(json), CancellationToken.None);

        Assert.Equal(1, await db.Comments.CountAsync());
        Assert.Equal(1, await db.Runners.CountAsync());
    }
}

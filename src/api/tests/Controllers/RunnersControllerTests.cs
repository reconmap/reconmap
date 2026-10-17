using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Authentication;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Xunit;

namespace tests.Controllers;

public class RunnersControllerTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task BootRunner_UpdatesLastBootAtAndLastPingAt()
    {
        using var db = CreateDbContext();
        var clientId = Guid.NewGuid();
        var runner = new Runner
        {
            Name = "Test Runner",
            ClientId = clientId.ToString(),
            Active = false
        };
        db.Runners.Add(runner);
        await db.SaveChangesAsync();

        var keycloakOptions = Options.Create(new KeycloakOptions());
        var controller = new RunnersController(db, new RunnerService(db), keycloakOptions);

        var body = new Dictionary<string, object>
        {
            { "version", "1.0.0" },
            { "hostname", "test-host" },
            { "arch", "amd64" },
            { "cpu", "4 cores" },
            { "memory", "8GB" },
            { "os", "linux" },
            { "ip", "127.0.0.1" },
            { "listen_addr", ":5520" }
        };

        var result = await controller.BootRunner(clientId, body);

        Assert.IsType<AcceptedResult>(result);

        var updatedRunner = await db.Runners.SingleAsync(a => a.ClientId == clientId.ToString());
        Assert.NotNull(updatedRunner.LastBootAt);
        Assert.NotNull(updatedRunner.LastPingAt);
        Assert.Equal("1.0.0", updatedRunner.Version);
        Assert.Equal("test-host", updatedRunner.Hostname);
    }

    [Fact]
    public async Task PatchRunner_UpdatesLastPingAt()
    {
        using var db = CreateDbContext();
        var clientId = Guid.NewGuid();
        var runner = new Runner
        {
            Name = "Test Runner",
            ClientId = clientId.ToString(),
            Active = false
        };
        db.Runners.Add(runner);
        await db.SaveChangesAsync();

        var keycloakOptions = Options.Create(new KeycloakOptions());
        var controller = new RunnersController(db, new RunnerService(db), keycloakOptions);

        var result = await controller.PatchRunner(clientId);

        Assert.IsType<AcceptedResult>(result);

        var updatedRunner = await db.Runners.SingleAsync(a => a.ClientId == clientId.ToString());
        Assert.NotNull(updatedRunner.LastPingAt);
    }
}

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Authentication;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace tests.Controllers;

public class AgentsControllerTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task BootAgent_UpdatesLastBootAtAndLastPingAt()
    {
        using var db = CreateDbContext();
        var clientId = Guid.NewGuid();
        var agent = new Agent
        {
            Name = "Test Agent",
            ClientId = clientId.ToString(),
            Active = false
        };
        db.Agents.Add(agent);
        await db.SaveChangesAsync();

        var keycloakOptions = Options.Create(new KeycloakOptions());
        var controller = new AgentsController(db, NullLogger<AgentsController>.Instance, keycloakOptions);

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

        var result = await controller.BootAgent(clientId, body);

        Assert.IsType<AcceptedResult>(result);

        var updatedAgent = await db.Agents.SingleAsync(a => a.ClientId == clientId.ToString());
        Assert.NotNull(updatedAgent.LastBootAt);
        Assert.NotNull(updatedAgent.LastPingAt);
        Assert.Equal("1.0.0", updatedAgent.Version);
        Assert.Equal("test-host", updatedAgent.Hostname);
    }

    [Fact]
    public async Task PatchAgent_UpdatesLastPingAt()
    {
        using var db = CreateDbContext();
        var clientId = Guid.NewGuid();
        var agent = new Agent
        {
            Name = "Test Agent",
            ClientId = clientId.ToString(),
            Active = false
        };
        db.Agents.Add(agent);
        await db.SaveChangesAsync();

        var keycloakOptions = Options.Create(new KeycloakOptions());
        var controller = new AgentsController(db, NullLogger<AgentsController>.Instance, keycloakOptions);

        var result = await controller.PatchAgent(clientId);

        Assert.IsType<AcceptedResult>(result);

        var updatedAgent = await db.Agents.SingleAsync(a => a.ClientId == clientId.ToString());
        Assert.NotNull(updatedAgent.LastPingAt);
    }
}

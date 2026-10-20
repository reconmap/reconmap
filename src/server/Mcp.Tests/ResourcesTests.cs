using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ModelContextProtocol;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.McpServer.Resources;
using Reconmap.McpServer.Security;
using Xunit;

namespace Mcp.Tests
{
    public class ResourcesTests
    {
        /// <summary>
        /// Guard stub: <paramref name="visible"/> null means privileged, otherwise the member project ids.
        /// </summary>
        private sealed class FakeGuard(IReadOnlyList<int>? visible) : McpAccessGuard(null!, null!, null!)
        {
            public override Task RequireReadAsync(string resourceType, int? projectId, int? resourceId = null,
                CancellationToken ct = default)
                => visible == null || (projectId.HasValue && visible.Contains(projectId.Value))
                    ? Task.CompletedTask
                    : throw new McpException("Access denied.");
        }

        private static AppDbContext GetContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "ReconmapMcpResourcesTestDb")
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            context.Set<UserInfo>().Add(new UserInfo { Id = 1 });
            context.Projects.Add(new Project { Id = 1, CreatedById = 1, Name = "Project 1", Visibility = "public" });
            context.Projects.Add(new Project { Id = 5, CreatedById = 1, Name = "Project 5", Visibility = "private" });
            context.Vulnerabilities.Add(new Vulnerability { Id = 10, CreatedById = 1, ProjectId = 1, Summary = "XSS in login", Risk = "high" });
            context.Vulnerabilities.Add(new Vulnerability { Id = 11, CreatedById = 1, ProjectId = 5, Summary = "SQLi in search", Risk = "critical" });
            context.SaveChanges();

            return context;
        }

        private static ProjectResources Projects(AppDbContext context, IReadOnlyList<int>? visible)
            => new(new ProjectService(context), new FakeGuard(visible));

        private static VulnerabilityResources Vulnerabilities(AppDbContext context, IReadOnlyList<int>? visible)
            => new(new VulnerabilityService(context), new FakeGuard(visible));

        [Fact]
        public async Task GetProject_Member_ReturnsProject()
        {
            using var context = GetContext();
            var json = await Projects(context, [5]).GetProject(5);

            Assert.Equal("Project 5", JsonDocument.Parse(json).RootElement.GetProperty("Name").GetString());
        }

        [Fact]
        public async Task GetProject_NonMember_IsDenied()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Projects(context, [5]).GetProject(1));
        }

        [Fact]
        public async Task GetProject_Unknown_Throws()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Projects(context, null).GetProject(999));
        }

        [Fact]
        public async Task GetProjectVulnerabilities_ReturnsOnlyThatProject()
        {
            using var context = GetContext();
            var json = await Vulnerabilities(context, [5]).GetProjectVulnerabilities(5);

            var items = JsonDocument.Parse(json).RootElement.EnumerateArray().ToList();
            Assert.Single(items);
            Assert.Equal(11, items[0].GetProperty("Id").GetInt32());
        }

        [Fact]
        public async Task GetProjectVulnerabilities_NonMember_IsDenied()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Vulnerabilities(context, [5]).GetProjectVulnerabilities(1));
        }

        [Fact]
        public async Task GetVulnerability_Member_ReturnsVulnerability()
        {
            using var context = GetContext();
            var json = await Vulnerabilities(context, [5]).GetVulnerability(11);

            Assert.Equal("SQLi in search", JsonDocument.Parse(json).RootElement.GetProperty("Summary").GetString());
        }

        [Fact]
        public async Task GetVulnerability_OtherProject_IsDenied()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Vulnerabilities(context, [5]).GetVulnerability(10));
        }

        [Fact]
        public async Task GetVulnerability_Unknown_Throws()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Vulnerabilities(context, null).GetVulnerability(999));
        }
    }
}

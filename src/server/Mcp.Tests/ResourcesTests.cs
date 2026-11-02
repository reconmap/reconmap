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
        private sealed class FakeGuard(IReadOnlyList<Guid>? visible) : McpAccessGuard(null!, null!, null!)
        {
            public override Task RequireReadAsync(string resourceType, Guid? projectId, Guid? resourceId = null,
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
            context.Projects.Add(new Project { Id = TestIds.Of(1), CreatedById = 1, Name = "Project 1" });
            context.Projects.Add(new Project { Id = TestIds.Of(5), CreatedById = 1, Name = "Project 5" });
            context.Findings.Add(new Finding { Id = TestIds.Of(10), CreatedById = 1, ProjectId = TestIds.Of(1), Summary = "XSS in login", Risk = "high" });
            context.Findings.Add(new Finding { Id = TestIds.Of(11), CreatedById = 1, ProjectId = TestIds.Of(5), Summary = "SQLi in search", Risk = "critical" });
            context.SaveChanges();

            return context;
        }

        private static ProjectResources Projects(AppDbContext context, IReadOnlyList<Guid>? visible)
            => new(new ProjectService(context), new FakeGuard(visible));

        private static FindingResources Findings(AppDbContext context, IReadOnlyList<Guid>? visible)
            => new(new FindingService(context), new FakeGuard(visible));

        [Fact]
        public async Task GetProject_Member_ReturnsProject()
        {
            using var context = GetContext();
            var json = await Projects(context, [TestIds.Of(5)]).GetProject(TestIds.Of(5));

            Assert.Equal("Project 5", JsonDocument.Parse(json).RootElement.GetProperty("Name").GetString());
        }

        [Fact]
        public async Task GetProject_NonMember_IsDenied()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Projects(context, [TestIds.Of(5)]).GetProject(TestIds.Of(1)));
        }

        [Fact]
        public async Task GetProject_Unknown_Throws()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Projects(context, null).GetProject(TestIds.Of(999)));
        }

        [Fact]
        public async Task GetProjectFindings_ReturnsOnlyThatProject()
        {
            using var context = GetContext();
            var json = await Findings(context, [TestIds.Of(5)]).GetProjectFindings(TestIds.Of(5));

            var items = JsonDocument.Parse(json).RootElement.EnumerateArray().ToList();
            Assert.Single(items);
            Assert.Equal(TestIds.Of(11), items[0].GetProperty("Id").GetGuid());
        }

        [Fact]
        public async Task GetProjectFindings_NonMember_IsDenied()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Findings(context, [TestIds.Of(5)]).GetProjectFindings(TestIds.Of(1)));
        }

        [Fact]
        public async Task GetFinding_Member_ReturnsFinding()
        {
            using var context = GetContext();
            var json = await Findings(context, [TestIds.Of(5)]).GetFinding(TestIds.Of(11));

            Assert.Equal("SQLi in search", JsonDocument.Parse(json).RootElement.GetProperty("Summary").GetString());
        }

        [Fact]
        public async Task GetFinding_OtherProject_IsDenied()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Findings(context, [TestIds.Of(5)]).GetFinding(TestIds.Of(10)));
        }

        [Fact]
        public async Task GetFinding_Unknown_Throws()
        {
            using var context = GetContext();

            await Assert.ThrowsAsync<McpException>(() => Findings(context, null).GetFinding(TestIds.Of(999)));
        }
    }
}

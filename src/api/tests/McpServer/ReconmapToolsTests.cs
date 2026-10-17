using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using ModelContextProtocol;
using Reconmap.McpServer.Tools;
using Reconmap.McpServer.Security;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Domain.Entities;

namespace Tests.McpServer
{
    public class ReconmapToolsTests
    {
        /// <summary>
        /// Guard stub: <paramref name="visible"/> null means privileged, otherwise the member project ids.
        /// </summary>
        private sealed class FakeGuard(IReadOnlyList<int>? visible) : McpAccessGuard(null!, null!, null!)
        {
            public override bool IsPrivileged => visible == null;

            public override Task<IReadOnlyList<int>?> VisibleProjectIdsAsync(CancellationToken ct = default)
                => Task.FromResult(visible);

            public override Task RequireReadAsync(string resourceType, int? projectId, int? resourceId = null,
                CancellationToken ct = default)
                => visible == null || (projectId.HasValue && visible.Contains(projectId.Value))
                    ? Task.CompletedTask
                    : throw new McpException("Access denied.");
        }

        private AppDbContext GetMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "ReconmapMcpTestDb")
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            context.Projects.Add(new Project { Id = 1, Name = "Internal Penetration Test", Visibility = "public" });
            context.Projects.Add(new Project { Id = 5, Name = "Project 5", Description = "Test description", Visibility = "private" });
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task ListProjects_Privileged_ReturnsAllProjects()
        {
            using var context = GetMemoryContext();
            var tools = new ReconmapTools(context, new FakeGuard(null));
            var result = await tools.ListProjects();

            Assert.Contains("Internal Penetration Test", result);
            Assert.Contains("Project 5", result);
        }

        [Fact]
        public async Task ListProjects_Member_ReturnsOnlyMemberProjects()
        {
            using var context = GetMemoryContext();
            var tools = new ReconmapTools(context, new FakeGuard([5]));
            var result = await tools.ListProjects();

            Assert.Contains("Project 5", result);
            Assert.DoesNotContain("Internal Penetration Test", result);
        }

        [Fact]
        public async Task GetProjectDetails_Member_ReturnsProject()
        {
            using var context = GetMemoryContext();
            var tools = new ReconmapTools(context, new FakeGuard([5]));
            var result = await tools.GetProjectDetails(5);

            Assert.Contains("Project 5", result);
        }

        [Fact]
        public async Task GetProjectDetails_NonMember_IsDenied()
        {
            using var context = GetMemoryContext();
            var tools = new ReconmapTools(context, new FakeGuard([5]));

            await Assert.ThrowsAsync<McpException>(() => tools.GetProjectDetails(1));
        }

        [Fact]
        public async Task GetProjectDetails_UnknownProject_Throws()
        {
            using var context = GetMemoryContext();
            var tools = new ReconmapTools(context, new FakeGuard(null));

            await Assert.ThrowsAsync<McpException>(() => tools.GetProjectDetails(999));
        }
    }
}

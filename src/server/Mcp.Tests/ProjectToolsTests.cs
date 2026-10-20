using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using ModelContextProtocol;
using Reconmap.Api.Application.Services;
using Reconmap.McpServer.Tools;
using Reconmap.McpServer.Security;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Domain.Entities;

namespace Mcp.Tests
{
    public class ProjectToolsTests
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

            context.Set<UserInfo>().Add(new UserInfo { Id = 1 });
            context.Projects.Add(new Project { Id = 1, CreatedById = 1, Name = "Internal Penetration Test", Visibility = "public" });
            context.Projects.Add(new Project { Id = 5, CreatedById = 1, Name = "Project 5", Description = "Test description", Visibility = "private" });
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task ListProjects_Privileged_ReturnsAllProjects()
        {
            using var context = GetMemoryContext();
            var tools = new ProjectTools(new ProjectService(context), new FakeGuard(null));
            var result = await tools.ListProjects();

            Assert.Contains(result, r => r.Name == "Internal Penetration Test");
            Assert.Contains(result, r => r.Name == "Project 5");
        }

        [Fact]
        public async Task ListProjects_Member_ReturnsOnlyMemberProjects()
        {
            using var context = GetMemoryContext();
            var tools = new ProjectTools(new ProjectService(context), new FakeGuard([5]));
            var result = await tools.ListProjects();

            Assert.Contains(result, r => r.Name == "Project 5");
            Assert.DoesNotContain(result, r => r.Name == "Internal Penetration Test");
        }

        [Fact]
        public async Task GetProjectDetails_Member_ReturnsProject()
        {
            using var context = GetMemoryContext();
            var tools = new ProjectTools(new ProjectService(context), new FakeGuard([5]));
            var result = await tools.GetProjectDetails(5);

            Assert.Equal("Project 5", result.Name);
        }

        [Fact]
        public async Task GetProjectDetails_NonMember_IsDenied()
        {
            using var context = GetMemoryContext();
            var tools = new ProjectTools(new ProjectService(context), new FakeGuard([5]));

            await Assert.ThrowsAsync<McpException>(() => tools.GetProjectDetails(1));
        }

        [Fact]
        public async Task GetProjectDetails_UnknownProject_Throws()
        {
            using var context = GetMemoryContext();
            var tools = new ProjectTools(new ProjectService(context), new FakeGuard(null));

            await Assert.ThrowsAsync<McpException>(() => tools.GetProjectDetails(999));
        }
    }
}

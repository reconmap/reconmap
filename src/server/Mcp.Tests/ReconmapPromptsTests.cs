using Microsoft.EntityFrameworkCore;
using ModelContextProtocol;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.McpServer.Prompts;
using Reconmap.McpServer.Security;
using Xunit;

namespace Mcp.Tests
{
    public class ReconmapPromptsTests
    {
        private sealed class FakeGuard(IReadOnlyList<Guid>? visible) : McpAccessGuard(null!, null!, null!)
        {
            public override Task RequireReadAsync(string resourceType, Guid? projectId, Guid? resourceId = null,
                CancellationToken ct = default)
                => visible == null || (projectId.HasValue && visible.Contains(projectId.Value))
                    ? Task.CompletedTask
                    : throw new McpException("Access denied.");
        }

        private static ReconmapPrompts Create(IReadOnlyList<Guid>? visible)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "ReconmapMcpPromptsTestDb")
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
            context.Set<UserInfo>().Add(new UserInfo { Id = 1 });
            context.Projects.Add(new Project { Id = TestIds.Of(1), CreatedById = 1, Name = "Project 1" });
            context.Projects.Add(new Project { Id = TestIds.Of(5), CreatedById = 1, Name = "Project 5" });
            context.SaveChanges();

            return new ReconmapPrompts(new ProjectService(context), new FakeGuard(visible));
        }

        [Fact]
        public async Task TriageFindings_Member_NamesProjectAndResource()
        {
            var text = await Create([TestIds.Of(5)]).TriageFindings(TestIds.Of(5).ToString());

            Assert.Contains("Project 5", text);
            Assert.Contains($"reconmap://projects/{TestIds.Of(5)}/findings", text);
        }

        [Fact]
        public async Task ExecutiveSummary_Member_NamesProject()
        {
            var text = await Create([TestIds.Of(5)]).ExecutiveSummary(TestIds.Of(5).ToString());

            Assert.Contains("Project 5", text);
        }

        [Fact]
        public async Task Prompts_NonMember_AreDenied()
        {
            var prompts = Create([TestIds.Of(5)]);

            await Assert.ThrowsAsync<McpException>(() => prompts.TriageFindings(TestIds.Of(1).ToString()));
            await Assert.ThrowsAsync<McpException>(() => prompts.ExecutiveSummary(TestIds.Of(1).ToString()));
        }

        [Fact]
        public async Task Prompts_InvalidProjectId_Throws()
        {
            await Assert.ThrowsAsync<McpException>(() => Create(null).TriageFindings("abc"));
        }

        [Fact]
        public async Task Prompts_MissingProjectId_ExplainsItIsRequired()
        {
            var ex = await Assert.ThrowsAsync<McpException>(() => Create(null).TriageFindings(""));

            Assert.Contains("required", ex.Message);
        }

        [Fact]
        public async Task Prompts_UnknownProject_Throws()
        {
            await Assert.ThrowsAsync<McpException>(() => Create(null).ExecutiveSummary(TestIds.Of(999).ToString()));
        }
    }
}

using Microsoft.EntityFrameworkCore;
using ModelContextProtocol;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.McpServer.Prompts;
using Reconmap.McpServer.Security;
using Xunit;

namespace Tests.McpServer
{
    public class ReconmapPromptsTests
    {
        private sealed class FakeGuard(IReadOnlyList<int>? visible) : McpAccessGuard(null!, null!, null!)
        {
            public override Task RequireReadAsync(string resourceType, int? projectId, int? resourceId = null,
                CancellationToken ct = default)
                => visible == null || (projectId.HasValue && visible.Contains(projectId.Value))
                    ? Task.CompletedTask
                    : throw new McpException("Access denied.");
        }

        private static ReconmapPrompts Create(IReadOnlyList<int>? visible)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "ReconmapMcpPromptsTestDb")
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
            context.Set<UserInfo>().Add(new UserInfo { Id = 1 });
            context.Projects.Add(new Project { Id = 1, CreatedByUid = 1, Name = "Project 1", Visibility = "public" });
            context.Projects.Add(new Project { Id = 5, CreatedByUid = 1, Name = "Project 5", Visibility = "private" });
            context.SaveChanges();

            return new ReconmapPrompts(new ProjectService(context), new FakeGuard(visible));
        }

        [Fact]
        public async Task TriageVulnerabilities_Member_NamesProjectAndResource()
        {
            var text = await Create([5]).TriageVulnerabilities("5");

            Assert.Contains("Project 5", text);
            Assert.Contains("reconmap://projects/5/vulnerabilities", text);
        }

        [Fact]
        public async Task ExecutiveSummary_Member_NamesProject()
        {
            var text = await Create([5]).ExecutiveSummary("5");

            Assert.Contains("Project 5", text);
        }

        [Fact]
        public async Task Prompts_NonMember_AreDenied()
        {
            var prompts = Create([5]);

            await Assert.ThrowsAsync<McpException>(() => prompts.TriageVulnerabilities("1"));
            await Assert.ThrowsAsync<McpException>(() => prompts.ExecutiveSummary("1"));
        }

        [Fact]
        public async Task Prompts_NonNumericProjectId_Throws()
        {
            await Assert.ThrowsAsync<McpException>(() => Create(null).TriageVulnerabilities("abc"));
        }

        [Fact]
        public async Task Prompts_MissingProjectId_ExplainsItIsRequired()
        {
            var ex = await Assert.ThrowsAsync<McpException>(() => Create(null).TriageVulnerabilities(""));

            Assert.Contains("required", ex.Message);
        }

        [Fact]
        public async Task Prompts_UnknownProject_Throws()
        {
            await Assert.ThrowsAsync<McpException>(() => Create(null).ExecutiveSummary("999"));
        }
    }
}

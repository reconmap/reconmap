using System.Threading.Tasks;
using Xunit;
using McpServer.Tools;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using api_v2.Domain.Entities;

namespace Tests.McpServer
{
    public class ReconmapToolsTests
    {
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
        public async Task ListProjects_ReturnsJsonString()
        {
            using var context = GetMemoryContext();
            var tools = new ReconmapTools(context);
            var result = await tools.ListProjects();

            Assert.NotNull(result);
            Assert.Contains("Internal Penetration Test", result);
        }

        [Fact]
        public async Task GetProjectDetails_ReturnsJsonStringWithId()
        {
            using var context = GetMemoryContext();
            var tools = new ReconmapTools(context);
            var result = await tools.GetProjectDetails(5);

            Assert.NotNull(result);
            Assert.Contains("Project 5", result);
        }
    }
}

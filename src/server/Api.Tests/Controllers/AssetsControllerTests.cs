using Reconmap.Api.Common;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace tests.Controllers;

public class AssetsControllerTests
{
    private sealed class FakeAiService : IAiService
    {
        public Task<string> GenerateRemediationAsync(string vulnerabilitySummary, Guid? projectId = null, int? userId = null) => Task.FromResult(string.Empty);
        public Task<AiParsingResult> ParseCommandOutputAsync(string toolName, string output, Guid? projectId = null, int? userId = null) => Task.FromResult(new AiParsingResult());
        public Task<string> EnrichAssetAsync(string assetName, string assetType, Guid? projectId = null, int? userId = null) => Task.FromResult(string.Empty);
        public Task<string> TriageVulnerabilityAsync(string summary, string description, Guid? projectId = null, int? userId = null) => Task.FromResult(string.Empty);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task EnsureOne_CreatesMissingUrlAsset()
    {
        using var db = CreateDbContext();
        var controller = new AssetsController(db, new FakeAiService());

        var result = await controller.EnsureOne(new AssetsController.EnsureAssetRequest
        {
            ProjectId = TestIds.Of(12),
            Name = "https://example.com",
            Type = "url"
        });

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var asset = Assert.IsType<Asset>(created.Value);
        Assert.Equal("https://example.com", asset.Name);
        Assert.Equal("url", asset.Type);

        var saved = await db.Assets.SingleAsync();
        Assert.Equal(TestIds.Of(12), saved.ProjectId);
        Assert.Equal("https://example.com", saved.Name);
    }

    [Fact]
    public async Task GetMany_WithLimit_ReturnsRequestedPageAndHeaders()
    {
        using var db = CreateDbContext();
        for (var i = 1; i <= 5; i++)
        {
            db.Assets.Add(new Asset { ProjectId = TestIds.Of(7), Name = $"asset-{i}", Type = "host" });
        }
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService());
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.HttpContext.Request.QueryString = new QueryString("?limit=2&page=3");

        var result = await controller.GetMany(TestIds.Of(7));

        var ok = Assert.IsType<OkObjectResult>(result);
        var assets = Assert.IsAssignableFrom<IEnumerable<Asset>>(ok.Value);
        Assert.Single(assets);
        Assert.Equal("5", controller.Response.Headers["X-Total-Count"]);
        Assert.Equal("3", controller.Response.Headers["X-Page-Count"]);
    }

    [Fact]
    public async Task GetMany_WithoutLimit_ReturnsAllAssets()
    {
        using var db = CreateDbContext();
        for (var i = 1; i <= 25; i++)
        {
            db.Assets.Add(new Asset { ProjectId = TestIds.Of(7), Name = $"asset-{i}", Type = "host" });
        }
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService());
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        var result = await controller.GetMany(TestIds.Of(7));

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(25, Assert.IsAssignableFrom<IEnumerable<Asset>>(ok.Value).Count());
        Assert.False(controller.Response.Headers.ContainsKey("X-Total-Count"));
    }

    [Fact]
    public async Task EnsureOne_ReturnsExistingAssetInsteadOfDuplicating()
    {
        using var db = CreateDbContext();
        db.Assets.Add(new Asset
        {
            ProjectId = TestIds.Of(4),
            Name = "https://example.com",
            Type = "url"
        });
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService());

        var result = await controller.EnsureOne(new AssetsController.EnsureAssetRequest
        {
            ProjectId = TestIds.Of(4),
            Name = "https://example.com",
            Type = "url"
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var asset = Assert.IsType<Asset>(ok.Value);
        Assert.Equal("https://example.com", asset.Name);
        Assert.Equal("url", asset.Type);

        Assert.Equal(1, await db.Assets.CountAsync());
    }
}

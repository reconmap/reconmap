using Reconmap.Api.Application.Services;
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
        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));

        var result = await controller.EnsureOne(new AssetsController.EnsureAssetRequest
        {
            ProjectId = TestIds.Of(12),
            Name = "https://example.com",
            Kind = "url"
        });

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var asset = Assert.IsType<Asset>(created.Value);
        Assert.Equal("https://example.com", asset.Name);
        Assert.Equal("url", asset.Kind);

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
            db.Assets.Add(new Asset { ProjectId = TestIds.Of(7), Name = $"asset-{i}", Kind = "host" });
        }
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));
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
            db.Assets.Add(new Asset { ProjectId = TestIds.Of(7), Name = $"asset-{i}", Kind = "host" });
        }
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));
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
            Kind = "url"
        });
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));

        var result = await controller.EnsureOne(new AssetsController.EnsureAssetRequest
        {
            ProjectId = TestIds.Of(4),
            Name = "https://example.com",
            Kind = "url"
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var asset = Assert.IsType<Asset>(ok.Value);
        Assert.Equal("https://example.com", asset.Name);
        Assert.Equal("url", asset.Kind);

        Assert.Equal(1, await db.Assets.CountAsync());
    }

    [Fact]
    public async Task GetMany_WithParentId_ReturnsOnlyChildren()
    {
        using var db = CreateDbContext();
        var host = new Asset { ProjectId = TestIds.Of(7), Name = "10.0.0.1", Kind = "host" };
        db.Assets.Add(host);
        await db.SaveChangesAsync();
        db.Assets.Add(new Asset { ProjectId = TestIds.Of(7), ParentId = host.Id, Name = "443/tcp", Kind = "port" });
        db.Assets.Add(new Asset { ProjectId = TestIds.Of(7), Name = "10.0.0.2", Kind = "host" });
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        var children = Assert.IsAssignableFrom<IEnumerable<Asset>>(
            Assert.IsType<OkObjectResult>(await controller.GetMany(TestIds.Of(7), host.Id)).Value);
        Assert.Equal("443/tcp", Assert.Single(children).Name);

        var roots = Assert.IsAssignableFrom<IEnumerable<Asset>>(
            Assert.IsType<OkObjectResult>(await controller.GetMany(TestIds.Of(7), rootsOnly: true)).Value);
        Assert.Equal(2, roots.Count());
    }

    [Fact]
    public async Task EnsureOne_SameNameUnderDifferentParentsCreatesTwoNodes()
    {
        using var db = CreateDbContext();
        var a = new Asset { ProjectId = TestIds.Of(1), Name = "a" };
        var b = new Asset { ProjectId = TestIds.Of(1), Name = "b" };
        db.Assets.AddRange(a, b);
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));
        foreach (var parent in new[] { a, b })
            await controller.EnsureOne(new AssetsController.EnsureAssetRequest
            {
                ProjectId = TestIds.Of(1), Name = "/admin", Kind = "path", ParentId = parent.Id
            });

        Assert.Equal(2, await db.Assets.CountAsync(x => x.Name == "/admin"));
    }

    [Fact]
    public async Task UpdateOne_RejectsMovingNodeUnderItsOwnDescendant()
    {
        using var db = CreateDbContext();
        var root = new Asset { ProjectId = TestIds.Of(1), Name = "root" };
        db.Assets.Add(root);
        await db.SaveChangesAsync();
        var child = new Asset { ProjectId = TestIds.Of(1), ParentId = root.Id, Name = "child" };
        db.Assets.Add(child);
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        var result = await controller.UpdateOne(root.Id, new AssetsController.UpdateAssetRequest
        {
            Name = "root", ParentId = child.Id
        });

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateOne_UpdatesFieldsAndNormalizesKind()
    {
        using var db = CreateDbContext();
        var asset = new Asset { ProjectId = TestIds.Of(1), Name = "old" };
        db.Assets.Add(asset);
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService(), new AssetUpsertService(db));
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };

        var result = await controller.UpdateOne(asset.Id, new AssetsController.UpdateAssetRequest
        {
            Name = " new ", Kind = " Leaked-Env ", Attributes = "{\"size\":12}"
        });

        Assert.IsType<OkObjectResult>(result);
        var saved = await db.Assets.SingleAsync();
        Assert.Equal("new", saved.Name);
        Assert.Equal("leaked-env", saved.Kind);
        Assert.Equal("{\"size\":12}", saved.Attributes);
    }
}

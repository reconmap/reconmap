using api_v2.Common;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace tests.Controllers;

public class AssetsControllerTests
{
    private sealed class FakeAiService : IAiService
    {
        public Task<string> GenerateRemediationAsync(string vulnerabilitySummary) => Task.FromResult(string.Empty);
        public Task<AiParsingResult> ParseCommandOutputAsync(string toolName, string output) => Task.FromResult(new AiParsingResult());
        public Task<string> EnrichAssetAsync(string assetName, string assetType) => Task.FromResult(string.Empty);
        public Task<string> TriageVulnerabilityAsync(string summary, string description) => Task.FromResult(string.Empty);
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
            ProjectId = 12,
            Name = "https://example.com",
            Type = "url"
        });

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var asset = Assert.IsType<Asset>(created.Value);
        Assert.Equal("https://example.com", asset.Name);
        Assert.Equal("url", asset.Type);

        var saved = await db.Assets.SingleAsync();
        Assert.Equal(12, saved.ProjectId);
        Assert.Equal("https://example.com", saved.Name);
    }

    [Fact]
    public async Task EnsureOne_ReturnsExistingAssetInsteadOfDuplicating()
    {
        using var db = CreateDbContext();
        db.Assets.Add(new Asset
        {
            ProjectId = 4,
            Name = "https://example.com",
            Type = "url"
        });
        await db.SaveChangesAsync();

        var controller = new AssetsController(db, new FakeAiService());

        var result = await controller.EnsureOne(new AssetsController.EnsureAssetRequest
        {
            ProjectId = 4,
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

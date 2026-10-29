using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace tests.Application.Services;

public class AssetUpsertServiceTests
{
    private static AppDbContext CreateDbContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options);

    private static Asset HostWithPorts(params string[] ports)
    {
        var host = new Asset { Name = "10.0.0.1", Kind = "Host" };
        foreach (var port in ports)
            host.AddChild(new Asset { Name = port, Kind = "port", Attributes = $"{{\"port\":\"{port}\"}}" });
        return host;
    }

    [Fact]
    public async Task UpsertTree_PersistsHierarchy()
    {
        using var db = CreateDbContext();
        var service = new AssetUpsertService(db);
        var projectId = TestIds.Of(1);

        var created = await service.UpsertTreeAsync(projectId, null, [HostWithPorts("80/tcp", "443/tcp")], "Nmap");

        Assert.Equal(3, created);
        var host = await db.Assets.SingleAsync(a => a.ParentId == null);
        Assert.Equal("host", host.Kind);
        Assert.Equal("Nmap", host.Source);
        Assert.Equal(2, await db.Assets.CountAsync(a => a.ParentId == host.Id));
    }

    [Fact]
    public async Task UpsertTree_SecondRunOnlyRefreshesLastSeenAndAddsNewChildren()
    {
        using var db = CreateDbContext();
        var service = new AssetUpsertService(db);
        var projectId = TestIds.Of(1);

        await service.UpsertTreeAsync(projectId, null, [HostWithPorts("80/tcp")], "Nmap");
        var first = await db.Assets.AsNoTracking().SingleAsync(a => a.ParentId == null);
        await Task.Delay(5);

        var created = await service.UpsertTreeAsync(projectId, null, [HostWithPorts("80/tcp", "22/tcp")], "Nmap");

        Assert.Equal(1, created);
        Assert.Equal(3, await db.Assets.CountAsync());
        var second = await db.Assets.AsNoTracking().SingleAsync(a => a.ParentId == null);
        Assert.Equal(first.FirstSeenAt, second.FirstSeenAt);
        Assert.True(second.LastSeenAt > first.LastSeenAt);
    }

    [Fact]
    public async Task Upsert_DoesNotMatchAssetsOfOtherProjects()
    {
        using var db = CreateDbContext();
        var service = new AssetUpsertService(db);

        var (a, createdA) = await service.UpsertAsync(TestIds.Of(1), null, new Asset { Name = "example.com" }, null);
        var (b, createdB) = await service.UpsertAsync(TestIds.Of(2), null, new Asset { Name = "example.com" }, null);

        Assert.True(createdA);
        Assert.True(createdB);
        Assert.NotEqual(a.Id, b.Id);
    }

    [Fact]
    public async Task Upsert_MergesAttributesWithoutDroppingExistingKeys()
    {
        using var db = CreateDbContext();
        var service = new AssetUpsertService(db);
        var projectId = TestIds.Of(1);

        await service.UpsertAsync(projectId, null, new Asset { Name = "x", Attributes = "{\"a\":1,\"b\":2}" }, null);
        var (asset, created) = await service.UpsertAsync(projectId, null,
            new Asset { Name = "x", Attributes = "{\"b\":3,\"c\":4}" }, null);

        Assert.False(created);
        Assert.Equal("{\"a\":1,\"b\":3,\"c\":4}", asset.Attributes);
    }

    [Fact]
    public void ParentId_IsAForeignKeyToAsset_SoInsertsAreOrderedParentFirst()
    {
        using var db = CreateDbContext();

        var foreignKey = Assert.Single(db.Model.FindEntityType(typeof(Asset))!.GetForeignKeys(),
            fk => fk.Properties.Any(p => p.Name == nameof(Asset.ParentId)));
        Assert.Equal(typeof(Asset), foreignKey.PrincipalEntityType.ClrType);
        Assert.Equal(DeleteBehavior.Cascade, foreignKey.DeleteBehavior);
    }
}

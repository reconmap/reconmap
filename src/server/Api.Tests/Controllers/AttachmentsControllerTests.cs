using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Reconmap.Api.Common;

namespace tests.Controllers;

public class AttachmentsControllerTests
{
    private sealed class RecordingAttachmentStorage : IAttachmentStorage
    {
        public string? SavedFileName { get; private set; }

        public Task<Stream> GetFileStreamAsync(string fileName) => Task.FromResult<Stream>(Stream.Null);
        public Task DeleteFileAsync(string fileName) => Task.CompletedTask;
        public Task<string> GetFileHashAsync(string fileName) => Task.FromResult("hash");

        public Task SaveFileAsync(string fileName, Stream stream)
        {
            SavedFileName = fileName;
            return Task.CompletedTask;
        }
    }

    private sealed class AllowAllAccessScope : IRequestAccessScope
    {
        public bool IsPrivileged => true;
        public bool CanAccessVault => true;
        public int UserId => 1;
        public Task<IReadOnlyList<Guid>> MemberProjectIdsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Guid>>([]);
        public Task<bool> CanAccessProjectAsync(Guid? projectId, CancellationToken cancellationToken = default) => Task.FromResult(true);
        public Task<bool> CanAccessSecretAsync(Reconmap.Api.Domain.Entities.Secret secret, CancellationToken cancellationToken = default) => Task.FromResult(true);
        public Task<bool> CanAccessParentAsync(string parentType, Guid parentId, CancellationToken cancellationToken = default) => Task.FromResult(true);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static (AttachmentsController Controller, RecordingAttachmentStorage Storage) CreateController(
        AppDbContext db, string clientFileName, int length, UploadSettings? uploads = null, string contentType = "application/octet-stream")
    {
        var storage = new RecordingAttachmentStorage();
        var controller = new AttachmentsController(
            db,
            storage,
            new AllowAllAccessScope(),
            Options.Create(new StorageSettings { Uploads = uploads ?? new UploadSettings() }))
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };
        var file = new FormFile(new MemoryStream(new byte[length]), 0, length, "file", clientFileName)
        {
            Headers = new HeaderDictionary { ["Content-Type"] = contentType }
        };
        controller.HttpContext.Items["DbUser"] = new Reconmap.Api.Domain.Entities.User { Id = 1 };
        controller.HttpContext.Request.Form = new FormCollection(
            new Dictionary<string, Microsoft.Extensions.Primitives.StringValues>(),
            new FormFileCollection { file });
        return (controller, storage);
    }

    [Fact]
    public async Task CreateMany_TraversalLookingClientFileName_StoresAFlatKey()
    {
        using var db = CreateDbContext();
        var (controller, storage) = CreateController(db, "test.txt/../../../evil.txt", 3);

        var result = await controller.CreateMany(parentId: TestIds.Of(1), parentType: "project");

        Assert.IsType<OkResult>(result);
        Assert.NotNull(storage.SavedFileName);
        Assert.Matches("^[0-9a-f]{32}\\.txt$", storage.SavedFileName);
    }

    [Theory]
    [InlineData("shell.php")]
    [InlineData("page.html")]
    [InlineData("vector.svg")]
    [InlineData("noextension")]
    public async Task CreateMany_DisallowedExtension_Returns415AndStoresNothing(string name)
    {
        using var db = CreateDbContext();
        var (controller, storage) = CreateController(db, name, 3);

        var result = await controller.CreateMany(parentId: TestIds.Of(1), parentType: "project");

        Assert.Equal(StatusCodes.Status415UnsupportedMediaType, Assert.IsType<ObjectResult>(result).StatusCode);
        Assert.Null(storage.SavedFileName);
    }

    [Fact]
    public async Task CreateMany_FileOverConfiguredSize_Returns413AndStoresNothing()
    {
        using var db = CreateDbContext();
        var (controller, storage) = CreateController(db, "big.txt", 11, new UploadSettings { MaxFileSizeBytes = 10 });

        var result = await controller.CreateMany(parentId: TestIds.Of(1), parentType: "project");

        Assert.Equal(StatusCodes.Status413PayloadTooLarge, Assert.IsType<ObjectResult>(result).StatusCode);
        Assert.Null(storage.SavedFileName);
    }

    [Fact]
    public async Task CreateMany_TooManyFiles_ReturnsBadRequest()
    {
        using var db = CreateDbContext();
        var (controller, _) = CreateController(db, "a.txt", 1, new UploadSettings { MaxFilesPerRequest = 1 });
        var extra = new FormFile(new MemoryStream([1]), 0, 1, "file", "b.txt");
        controller.HttpContext.Request.Form = new FormCollection(
            new Dictionary<string, Microsoft.Extensions.Primitives.StringValues>(),
            new FormFileCollection { controller.HttpContext.Request.Form.Files[0], extra });

        var result = await controller.CreateMany(parentId: TestIds.Of(1), parentType: "project");

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateMany_StoresServerDerivedMimeType_NotTheClientOne()
    {
        using var db = CreateDbContext();
        var (controller, _) = CreateController(db, "notes.txt", 3, contentType: "text/html");

        await controller.CreateMany(parentId: TestIds.Of(1), parentType: "project");

        Assert.Equal("text/plain", (await db.Attachments.SingleAsync()).FileMimeType);
    }

    [Fact]
    public void UploadSettings_ConfiguredExtensions_AreNormalisedAndOutOfRangeSizesClamped()
    {
        var settings = new UploadSettings { AllowedExtensions = ["PDF", ".Txt"], MaxFileSizeBytes = long.MaxValue };

        Assert.Equal(new[] { ".pdf", ".txt" }, settings.EffectiveAllowedExtensions().Order());
        Assert.Equal(int.MaxValue, settings.EffectiveMaxFileSizeBytes);
    }
}

using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Infrastructure.Persistence;
using api_v2.Infrastructure.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

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
        public Task<IReadOnlyList<int>> MemberProjectIdsAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<int>>([]);
        public Task<bool> CanAccessProjectAsync(int? projectId, CancellationToken cancellationToken = default) => Task.FromResult(true);
        public Task<bool> CanAccessSecretAsync(api_v2.Domain.Entities.Secret secret, CancellationToken cancellationToken = default) => Task.FromResult(true);
        public Task<bool> CanAccessParentAsync(string parentType, int parentId, CancellationToken cancellationToken = default) => Task.FromResult(true);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateMany_TraversalLookingClientFileName_StoresAFlatPhpKey()
    {
        const string clientFileName = "test.txt/../../../evil.php";
        using var db = CreateDbContext();
        var storage = new RecordingAttachmentStorage();
        var controller = new AttachmentsController(
            db,
            NullLogger<AttachmentsController>.Instance,
            storage,
            new AllowAllAccessScope())
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };
        var file = new FormFile(new MemoryStream([1, 2, 3]), 0, 3, "file", clientFileName)
        {
            Headers = new HeaderDictionary { ["Content-Type"] = "application/octet-stream" }
        };
        controller.HttpContext.Items["DbUser"] = new api_v2.Domain.Entities.User { Id = 1 };
        controller.HttpContext.Request.Form = new FormCollection(
            new Dictionary<string, Microsoft.Extensions.Primitives.StringValues>(),
            new FormFileCollection { file });

        var result = await controller.CreateMany(parentId: 1, parentType: "project");

        Assert.IsType<OkResult>(result);
        Assert.Equal(".php", Path.GetExtension(clientFileName));
        Assert.NotNull(storage.SavedFileName);
        Assert.Matches("^[0-9a-f]{32}\\.php$", storage.SavedFileName);
        Assert.DoesNotContain('/', storage.SavedFileName);
        Assert.DoesNotContain('\\', storage.SavedFileName);
    }
}

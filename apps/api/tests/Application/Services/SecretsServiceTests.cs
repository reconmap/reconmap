using api_v2.Application.Services;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace tests.Application.Services;

public class SecretsServiceTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateAsync_SavesSecretToDatabase()
    {
        // Arrange
        var db = CreateDbContext();
        var service = new SecretsService(db);

        // Act
        var secret = await service.CreateAsync(1, "password", "My Secret", "password", "Sensitive Value", "note", null);

        // Assert
        Assert.NotNull(secret);
        Assert.True(secret.Id > 0);
        var dbSecret = await db.Secrets.FindAsync(secret.Id);
        Assert.NotNull(dbSecret);
        Assert.Equal("My Secret", dbSecret.Name);
    }

    [Fact]
    public async Task DecryptAsync_WithCorrectPassword_ReturnsDecryptedValue()
    {
        // Arrange
        var db = CreateDbContext();
        var service = new SecretsService(db);
        var created = await service.CreateAsync(1, "password", "My Secret", "password", "Sensitive Value", null, null);

        // Act
        var result = await service.DecryptAsync(created.Id, "password");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Sensitive Value", result.Value.Value);
    }

    [Fact]
    public async Task DecryptAsync_WithWrongPassword_ReturnsNull()
    {
        // Arrange
        var db = CreateDbContext();
        var service = new SecretsService(db);
        var created = await service.CreateAsync(1, "password", "My Secret", "password", "Sensitive Value", null, null);

        // Act
        var result = await service.DecryptAsync(created.Id, "wrongpassword");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesSecretAndChangesEncryption()
    {
        // Arrange
        var db = CreateDbContext();
        var service = new SecretsService(db);
        var created = await service.CreateAsync(1, "password", "My Secret", "password", "Old Value", null, null);
        var oldIv = created.Iv;

        // Act
        var success = await service.UpdateAsync(created.Id, "password", "New Name", "password", "New Value", "new note", null);

        // Assert
        Assert.True(success);
        var updated = await db.Secrets.FindAsync(created.Id);
        Assert.NotNull(updated);
        Assert.Equal("New Name", updated.Name);
        Assert.NotEqual(oldIv, updated.Iv);

        var decryptResult = await service.DecryptAsync(created.Id, "password");
        Assert.Equal("New Value", decryptResult!.Value.Value);
    }

    [Fact]
    public async Task DeleteAsync_RemovesSecretFromDatabase()
    {
        // Arrange
        var db = CreateDbContext();
        var service = new SecretsService(db);
        var created = await service.CreateAsync(1, "password", "My Secret", "password", "Value", null, null);

        // Act
        var success = await service.DeleteAsync(created.Id);

        // Assert
        Assert.True(success);
        var deleted = await db.Secrets.FindAsync(created.Id);
        Assert.Null(deleted);
    }
}

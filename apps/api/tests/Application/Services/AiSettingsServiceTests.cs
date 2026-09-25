using api_v2.Application.Services;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace tests.Application.Services;

public class AiSettingsServiceTests
{
    [Fact]
    public async Task UpdateAsync_StoresGenericValuesAndMasksEncryptedSecrets()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var response = await service.UpdateAsync(new AiSettingsUpdateRequest
        {
            Provider = "Router",
            MaxOutputTokens = 2048,
            Settings = new Dictionary<string, string?>
            {
                ["apiKey"] = "top-secret",
                ["model"] = " vendor/model "
            }
        });

        var secret = await db.AiProviderSettings.SingleAsync(row => row.SettingKey == "apiKey");
        Assert.NotEqual("top-secret", secret.SettingValue);
        Assert.True(secret.IsSecret);
        Assert.True(response.Providers.Single().Fields.Single(field => field.Key == "apiKey").HasValue);
        Assert.DoesNotContain("apiKey", response.Values["Router"].Keys);
        Assert.Equal("vendor/model", response.Values["Router"]["model"]);

        var runtime = await service.GetRuntimeSettingsAsync();
        Assert.Equal("top-secret", runtime.Values["apiKey"]);
        Assert.Equal(2048, runtime.MaxOutputTokens);
    }

    [Fact]
    public async Task UpdateAsync_OmittedSecretPreservesItAndNullClearsIt()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db, secretRequired: false);
        await service.UpdateAsync(new AiSettingsUpdateRequest
        {
            Provider = "Router",
            Settings = new Dictionary<string, string?> { ["apiKey"] = "first", ["model"] = "one" }
        });
        var encrypted = (await db.AiProviderSettings.SingleAsync(row => row.SettingKey == "apiKey")).SettingValue;

        await service.UpdateAsync(new AiSettingsUpdateRequest
        {
            Provider = "Router",
            Settings = new Dictionary<string, string?> { ["model"] = "two" }
        });
        Assert.Equal(encrypted, (await db.AiProviderSettings.SingleAsync(row => row.SettingKey == "apiKey")).SettingValue);

        await service.UpdateAsync(new AiSettingsUpdateRequest
        {
            Provider = "Router",
            Settings = new Dictionary<string, string?> { ["apiKey"] = null }
        });
        Assert.False(await db.AiProviderSettings.AnyAsync(row => row.SettingKey == "apiKey"));
    }

    [Fact]
    public async Task UpdateAsync_RejectsUnknownSettingsAndMissingRequiredValues()
    {
        await using var unknownDb = CreateDbContext();
        var unknownService = CreateService(unknownDb);
        await Assert.ThrowsAsync<ArgumentException>(() => unknownService.UpdateAsync(new AiSettingsUpdateRequest
        {
            Provider = "Router",
            Settings = new Dictionary<string, string?> { ["unsupported"] = "value" }
        }));

        await using var missingDb = CreateDbContext();
        var missingService = CreateService(missingDb);
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            missingService.UpdateAsync(new AiSettingsUpdateRequest
            {
                Provider = "Router",
                Settings = new Dictionary<string, string?> { ["model"] = "vendor/model" }
            }));
        Assert.Equal("Router API key is not configured.", exception.Message);
    }

    [Fact]
    public async Task GetAsync_UsesCatalogDefaultsWithoutPersistingProviderRows()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var response = await service.GetAsync();

        Assert.Equal("Router", response.Provider);
        Assert.Equal("default/model", response.Values["Router"]["model"]);
        Assert.Empty(db.AiProviderSettings);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static AiSettingsService CreateService(AppDbContext db, bool secretRequired = true) =>
        new(db, new EphemeralDataProtectionProvider(), CreateCatalog(secretRequired));

    private static IAiProviderCatalog CreateCatalog(bool secretRequired)
    {
        var options = Options.Create(new AiProviderCatalogOptions
        {
            DefaultProvider = "Router",
            Providers =
            [
                new AiProviderDefinition
                {
                    Id = "Router",
                    Name = "Router",
                    Adapter = "openai-compatible",
                    Endpoint = "https://example.com/v1",
                    Fields =
                    [
                        new AiProviderFieldDefinition
                        {
                            Key = "apiKey", Label = "API key", Type = "secret", Required = secretRequired
                        },
                        new AiProviderFieldDefinition
                        {
                            Key = "model", Label = "Model", Required = true, DefaultValue = "default/model"
                        }
                    ]
                }
            ]
        });
        return new AiProviderCatalog(options);
    }
}

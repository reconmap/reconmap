using api_v2.Application.Services;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace tests.Application.Services;

public class MailSettingsServiceTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static MailSettingsService CreateService(AppDbContext db)
    {
        return new MailSettingsService(db, new EphemeralDataProtectionProvider());
    }

    [Fact]
    public async Task UpdateAsync_EncryptsPasswordsAndMasksResponse()
    {
        var db = CreateDbContext();
        var service = CreateService(db);

        var response = await service.UpdateAsync(new MailSettingsUpdateRequest
        {
            SmtpHost = "smtp.example.com",
            SmtpPort = 587,
            SmtpUsername = "smtp-user",
            SmtpPassword = "smtp-secret",
            SmtpFromEmail = "no-reply@example.com",
            SmtpFromName = "Reconmap",
            SmtpUseSsl = true,
            ImapHost = "imap.example.com",
            ImapPort = 993,
            ImapUsername = "imap-user",
            ImapPassword = "imap-secret",
            ImapUseSsl = true
        });

        var settings = await db.MailSettings.SingleAsync();

        Assert.True(response.HasSmtpPassword);
        Assert.True(response.HasImapPassword);
        Assert.Equal("smtp.example.com", response.SmtpHost);
        Assert.NotEqual("smtp-secret", settings.SmtpPassword);
        Assert.NotEqual("imap-secret", settings.ImapPassword);
    }

    [Fact]
    public async Task GetSmtpSettingsAsync_ReturnsDecryptedSettings()
    {
        var db = CreateDbContext();
        var service = CreateService(db);

        await service.UpdateAsync(new MailSettingsUpdateRequest
        {
            SmtpHost = "smtp.example.com",
            SmtpPort = 465,
            SmtpUsername = "smtp-user",
            SmtpPassword = "smtp-secret",
            SmtpFromEmail = "sender@example.com",
            SmtpFromName = "Reconmap",
            SmtpUseSsl = true
        });

        var smtpSettings = await service.GetSmtpSettingsAsync();

        Assert.Equal("smtp.example.com", smtpSettings.Host);
        Assert.Equal(465, smtpSettings.Port);
        Assert.Equal("smtp-user", smtpSettings.Username);
        Assert.Equal("smtp-secret", smtpSettings.Password);
        Assert.Equal("sender@example.com", smtpSettings.FromEmail);
        Assert.Equal("Reconmap", smtpSettings.FromName);
        Assert.True(smtpSettings.UseSsl);
    }

    [Fact]
    public async Task UpdateAsync_CanClearStoredPasswords()
    {
        var db = CreateDbContext();
        var service = CreateService(db);

        await service.UpdateAsync(new MailSettingsUpdateRequest
        {
            SmtpHost = "smtp.example.com",
            SmtpPort = 587,
            SmtpPassword = "smtp-secret",
            SmtpFromEmail = "sender@example.com",
            ImapPassword = "imap-secret"
        });

        var response = await service.UpdateAsync(new MailSettingsUpdateRequest
        {
            SmtpHost = "smtp.example.com",
            SmtpPort = 587,
            SmtpFromEmail = "sender@example.com",
            ClearSmtpPassword = true,
            ClearImapPassword = true
        });

        var settings = await db.MailSettings.SingleAsync();

        Assert.False(response.HasSmtpPassword);
        Assert.False(response.HasImapPassword);
        Assert.Null(settings.SmtpPassword);
        Assert.Null(settings.ImapPassword);
    }
}

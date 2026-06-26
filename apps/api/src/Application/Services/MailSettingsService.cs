using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

public sealed class MailSettingsResponse
{
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpFromEmail { get; set; }
    public string? SmtpFromName { get; set; }
    public bool SmtpUseSsl { get; set; } = true;
    public bool HasSmtpPassword { get; set; }
    public string? ImapHost { get; set; }
    public int ImapPort { get; set; } = 993;
    public string? ImapUsername { get; set; }
    public bool ImapUseSsl { get; set; } = true;
    public bool HasImapPassword { get; set; }
}

public sealed class MailSettingsUpdateRequest
{
    public string? SmtpHost { get; set; }
    public int? SmtpPort { get; set; }
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public bool ClearSmtpPassword { get; set; }
    public string? SmtpFromEmail { get; set; }
    public string? SmtpFromName { get; set; }
    public bool SmtpUseSsl { get; set; } = true;
    public string? ImapHost { get; set; }
    public int? ImapPort { get; set; }
    public string? ImapUsername { get; set; }
    public string? ImapPassword { get; set; }
    public bool ClearImapPassword { get; set; }
    public bool ImapUseSsl { get; set; } = true;
}

public sealed class SmtpDeliverySettings
{
    public required string Host { get; init; }
    public required int Port { get; init; }
    public string? Username { get; init; }
    public string? Password { get; init; }
    public required string FromEmail { get; init; }
    public string? FromName { get; init; }
    public bool UseSsl { get; init; }
}

public interface IMailSettingsService
{
    Task<MailSettingsResponse> GetAsync(CancellationToken cancellationToken = default);
    Task<MailSettingsResponse> UpdateAsync(MailSettingsUpdateRequest request, CancellationToken cancellationToken = default);
    Task<SmtpDeliverySettings> GetSmtpSettingsAsync(CancellationToken cancellationToken = default);
}

public sealed class MailSettingsService(AppDbContext db, IDataProtectionProvider dataProtectionProvider) : IMailSettingsService
{
    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector("mail-settings-passwords");

    public async Task<MailSettingsResponse> GetAsync(CancellationToken cancellationToken = default)
    {
        var settings = await db.MailSettings
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);

        return ToResponse(settings);
    }

    public async Task<MailSettingsResponse> UpdateAsync(MailSettingsUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await db.MailSettings
            .SingleOrDefaultAsync(s => s.Id == 1, cancellationToken);

        if (settings == null)
        {
            settings = new MailSettings { Id = 1 };
            db.MailSettings.Add(settings);
        }

        settings.SmtpHost = NormalizeText(request.SmtpHost);
        settings.SmtpPort = NormalizePort(request.SmtpPort);
        settings.SmtpUsername = NormalizeText(request.SmtpUsername);
        settings.SmtpFromEmail = NormalizeText(request.SmtpFromEmail);
        settings.SmtpFromName = NormalizeText(request.SmtpFromName);
        settings.SmtpUseSsl = request.SmtpUseSsl;
        settings.ImapHost = NormalizeText(request.ImapHost);
        settings.ImapPort = NormalizePort(request.ImapPort);
        settings.ImapUsername = NormalizeText(request.ImapUsername);
        settings.ImapUseSsl = request.ImapUseSsl;

        if (request.ClearSmtpPassword)
            settings.SmtpPassword = null;
        else if (!string.IsNullOrWhiteSpace(request.SmtpPassword))
            settings.SmtpPassword = _protector.Protect(request.SmtpPassword.Trim());

        if (request.ClearImapPassword)
            settings.ImapPassword = null;
        else if (!string.IsNullOrWhiteSpace(request.ImapPassword))
            settings.ImapPassword = _protector.Protect(request.ImapPassword.Trim());

        await db.SaveChangesAsync(cancellationToken);

        return ToResponse(settings);
    }

    public async Task<SmtpDeliverySettings> GetSmtpSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await db.MailSettings
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.Id == 1, cancellationToken)
            ?? throw new InvalidOperationException("SMTP settings are not configured.");

        if (string.IsNullOrWhiteSpace(settings.SmtpHost) || !settings.SmtpPort.HasValue || string.IsNullOrWhiteSpace(settings.SmtpFromEmail))
            throw new InvalidOperationException("SMTP settings are incomplete. Configure the SMTP host, port and sender email first.");

        string? smtpPassword = null;
        if (!string.IsNullOrWhiteSpace(settings.SmtpPassword))
        {
            try
            {
                smtpPassword = _protector.Unprotect(settings.SmtpPassword);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("The stored SMTP password could not be decrypted. Save the SMTP password again.", ex);
            }
        }

        return new SmtpDeliverySettings
        {
            Host = settings.SmtpHost,
            Port = settings.SmtpPort.Value,
            Username = NormalizeText(settings.SmtpUsername),
            Password = smtpPassword,
            FromEmail = settings.SmtpFromEmail,
            FromName = NormalizeText(settings.SmtpFromName),
            UseSsl = settings.SmtpUseSsl
        };
    }

    private static MailSettingsResponse ToResponse(MailSettings? settings)
    {
        return new MailSettingsResponse
        {
            SmtpHost = settings?.SmtpHost,
            SmtpPort = settings?.SmtpPort ?? 587,
            SmtpUsername = settings?.SmtpUsername,
            SmtpFromEmail = settings?.SmtpFromEmail,
            SmtpFromName = settings?.SmtpFromName,
            SmtpUseSsl = settings?.SmtpUseSsl ?? true,
            HasSmtpPassword = !string.IsNullOrWhiteSpace(settings?.SmtpPassword),
            ImapHost = settings?.ImapHost,
            ImapPort = settings?.ImapPort ?? 993,
            ImapUsername = settings?.ImapUsername,
            ImapUseSsl = settings?.ImapUseSsl ?? true,
            HasImapPassword = !string.IsNullOrWhiteSpace(settings?.ImapPassword)
        };
    }

    private static string? NormalizeText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static int? NormalizePort(int? value)
    {
        return value is > 0 ? value : null;
    }
}

using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using api_v2.Common.Messaging;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

public sealed class ReportEmailJob
{
    public uint ReportId { get; set; }
    public uint RequestedByUserId { get; set; }
    public required List<string> Recipients { get; set; }
    public required string Subject { get; set; }
    public string Body { get; set; } = string.Empty;
}

public sealed class ReportEmailProcessor(
    ILogger<ReportEmailProcessor> logger,
    IServiceScopeFactory scopeFactory,
    IMessageQueue messageQueue) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Report email processor started, watching 'report-emails' queue");

        await messageQueue.SubscribeAsync<ReportEmailJob>("report-emails", async job =>
        {
            await ProcessReportEmailJobAsync(job, stoppingToken);
        }, stoppingToken);
    }

    private async Task ProcessReportEmailJobAsync(ReportEmailJob job, CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var attachmentStorage = scope.ServiceProvider.GetRequiredService<IAttachmentStorage>();
        var mailSettingsService = scope.ServiceProvider.GetRequiredService<IMailSettingsService>();

        try
        {
            var attachment = await db.Attachments
                .AsNoTracking()
                .SingleOrDefaultAsync(a => a.ParentType == "report" && a.ParentId == job.ReportId, cancellationToken)
                ?? throw new InvalidOperationException($"Attachment for report '{job.ReportId}' was not found.");

            var smtpSettings = await mailSettingsService.GetSmtpSettingsAsync(cancellationToken);

            await using var storedFile = await attachmentStorage.GetFileStreamAsync(attachment.FileName);
            await using var attachmentStream = new MemoryStream();
            await storedFile.CopyToAsync(attachmentStream, cancellationToken);
            attachmentStream.Position = 0;

            using var message = new MailMessage
            {
                From = string.IsNullOrWhiteSpace(smtpSettings.FromName)
                    ? new MailAddress(smtpSettings.FromEmail)
                    : new MailAddress(smtpSettings.FromEmail, smtpSettings.FromName),
                Subject = job.Subject,
                Body = job.Body,
                IsBodyHtml = false
            };

            foreach (var recipient in job.Recipients)
            {
                message.To.Add(recipient);
            }

            message.Attachments.Add(new System.Net.Mail.Attachment(
                attachmentStream,
                attachment.ClientFileName,
                attachment.FileMimeType ?? MediaTypeNames.Application.Octet));

            using var smtpClient = new SmtpClient(smtpSettings.Host, smtpSettings.Port)
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                EnableSsl = smtpSettings.UseSsl
            };

            if (!string.IsNullOrWhiteSpace(smtpSettings.Username))
            {
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(smtpSettings.Username, smtpSettings.Password);
            }

            await smtpClient.SendMailAsync(message);

            await CreateUserNotificationAsync(
                db,
                job.RequestedByUserId,
                "Report email queued successfully",
                $"The report email was delivered to {job.Recipients.Count} recipient(s).",
                cancellationToken);

            await messageQueue.PublishAsync("notifications", new { type = "message" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send report '{ReportId}' by email", job.ReportId);

            await CreateUserNotificationAsync(
                db,
                job.RequestedByUserId,
                "Report email failed",
                $"Reconmap could not send the report email: {ex.Message}",
                cancellationToken);

            await messageQueue.PublishAsync("notifications", new { type = "message" });
        }
    }

    private static async Task CreateUserNotificationAsync(
        AppDbContext db,
        uint userId,
        string title,
        string content,
        CancellationToken cancellationToken)
    {
        db.Notifications.Add(new Notification
        {
            ToUserId = userId,
            Title = title,
            Content = content,
            Status = NotificationStatus.unread.ToString().ToLowerInvariant()
        });

        await db.SaveChangesAsync(cancellationToken);
    }
}

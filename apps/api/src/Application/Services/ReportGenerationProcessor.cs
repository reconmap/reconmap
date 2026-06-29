using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using api_v2.Common.Messaging;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Scriban;

namespace api_v2.Application.Services;

public static class WordTemplateReplacer
{
    public static void ReplaceContentControls(
        Body body,
        IReadOnlyDictionary<string, string> values)
    {
        foreach (var sdt in body.Descendants<SdtElement>())
        {
            var tag = sdt.SdtProperties?
                .GetFirstChild<Tag>()?
                .Val?.Value;

            if (tag == null)
                continue;

            if (!values.TryGetValue(tag, out var replacement))
                continue;

            ReplaceSdtText(sdt, replacement);
        }
    }

    public static void PopulateTableAtBookmark(
        Body body,
        string bookmarkName,
        IEnumerable<IDictionary<string, string>> rows)
    {
        // 1. Find the bookmark
        var bookmark = body.Descendants<BookmarkStart>()
            .FirstOrDefault(b => b.Name == bookmarkName);

        if (bookmark == null)
            return;

        // 2. Find the table
        var table = bookmark.Ancestors<Table>().FirstOrDefault();
        if (table == null)
            return;

        // 3. Get the template row (first row AFTER header)
        var allRows = table.Elements<TableRow>().ToList();
        if (allRows.Count < 2)
            return;

        var templateRow = allRows[1];
        templateRow.Remove();

        // 4. Populate
        foreach (var rowData in rows)
        {
            var newRow = (TableRow)templateRow.CloneNode(true);

            // Replace SDTs if present
            foreach (var sdt in newRow.Descendants<SdtElement>())
            {
                var tag = sdt.SdtProperties?
                    .GetFirstChild<Tag>()?
                    .Val?.Value;

                if (tag != null && rowData.TryGetValue(tag, out var value)) ReplaceSdtText(sdt, value);
            }

            table.AppendChild(newRow);
        }
    }

    private static void ReplaceSdtText(SdtElement sdt, string value)
    {
        var textElements = sdt.Descendants<Text>().ToList();

        if (!textElements.Any())
            return;

        // Replace first text node
        textElements.First().Text = value;

        // Clear remaining text nodes to avoid duplication
        foreach (var text in textElements.Skip(1))
            text.Text = string.Empty;
    }

    public static void PopulateRichTextList(
        Body body,
        string outerSdtTag,
        IEnumerable<Dictionary<string, string>> items)
    {
        // Find template SDT
        var templateSdt = body.Descendants<SdtElement>()
            .FirstOrDefault(sdt =>
                sdt.SdtProperties?
                    .GetFirstChild<Tag>()?.Val == outerSdtTag);

        if (templateSdt == null)
            return;


        foreach (var item in items)
        {
            var newSdt = (SdtElement)templateSdt.CloneNode(true);

            foreach (var innerSdt in newSdt.Descendants<SdtElement>())
            {
                var tag = innerSdt.SdtProperties?
                    .GetFirstChild<Tag>()?
                    .Val?.Value;

                if (tag != null && item.TryGetValue(tag, out var value)) ReplaceSdtText(innerSdt, value);
            }

            templateSdt.Parent.AppendChild(newSdt);
        }

        templateSdt.Remove(); // remove placeholder
    }
}

public sealed class ReportGenerationJob
{
    public uint ReportId { get; set; }
    public uint ProjectId { get; set; }
    public uint ReportTemplateId { get; set; }
    public uint CreatedByUserId { get; set; }
}

public sealed class ReportGenerationProcessor(
    ILogger<ReportGenerationProcessor> logger,
    IServiceScopeFactory scopeFactory,
    IMessageQueue messageQueue) : BackgroundService
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Report generation processor started, watching 'report-generation' queue");

        await messageQueue.SubscribeAsync<ReportGenerationJob>("report-generation", async job =>
        {
            await ProcessReportGenerationJobAsync(job, stoppingToken);
        }, stoppingToken);
    }

    private async Task ProcessReportGenerationJobAsync(ReportGenerationJob job, CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var attachmentStorage = scope.ServiceProvider.GetRequiredService<IAttachmentStorage>();

        logger.LogInformation("Starting generation of report {ReportId} for project {ProjectId}", job.ReportId, job.ProjectId);

        try
        {
            var project = await dbContext.Projects.AsNoTracking()
                .Include(p => p.Client)
                .Include(p => p.ServiceProvider)
                .FirstOrDefaultAsync(p => p.Id == job.ProjectId, cancellationToken);

            if (project == null)
            {
                logger.LogError("Project {ProjectId} not found for report {ReportId}", job.ProjectId, job.ReportId);
                return;
            }

            var report = await dbContext.Reports
                .FirstOrDefaultAsync(r => r.Id == job.ReportId, cancellationToken);

            if (report == null)
            {
                logger.LogError("Report {ReportId} not found in database", job.ReportId);
                return;
            }

            var templateAttachment = await dbContext.Attachments
                .Where(a => a.ParentId == job.ReportTemplateId && a.ParentType == "report")
                .FirstOrDefaultAsync(cancellationToken);

            if (templateAttachment == null)
            {
                logger.LogError("Template attachment not found for template ID {TemplateId}", job.ReportTemplateId);
                return;
            }

            var templateExtension = Path.GetExtension(templateAttachment.FileName);
            var clientFileName = $"reconmap-{project.Name}-v{report.VersionName}" + templateExtension;
            var reportFileName = _attachmentFilePath.GenerateFileName(templateExtension);

            var replacements = new Dictionary<string, string?>
            {
                ["project.name"] = project.Name,
                ["client.name"] = project.Client?.Name,
                ["serviceProvider.name"] = project.ServiceProvider?.Name,
                ["report.date"] = DateTime.Today.ToString("dd/MM/yyyy")
            };

            var assets = (await dbContext.Assets
                    .Where(a => a.ProjectId == project.Id)
                    .Select(a => new { a.Name, a.Kind })
                    .ToListAsync(cancellationToken))
                .Select(a => new Dictionary<string, string>
                {
                    ["asset.name"] = a.Name,
                    ["asset.type"] = a.Kind ?? string.Empty,
                })
                .ToArray();

            var findings = (await dbContext.Vulnerabilities
                    .Where(v => v.ProjectId == project.Id)
                    .Select(v => new { v.Summary, CategoryName = v.Category.Name, v.Risk })
                    .ToListAsync(cancellationToken))
                .Select(v => new Dictionary<string, string>()
                {
                    ["finding.summary"] = v.Summary,
                    ["finding.category.name"] = v.CategoryName,
                    ["finding.severity"] = v.Risk
                })
                .ToArray();

            var tempFilePath = Path.GetTempFileName();
            try
            {
                await using (var templateStream = await attachmentStorage.GetFileStreamAsync(templateAttachment.FileName))
                {
                    await using (var fileStream = System.IO.File.OpenWrite(tempFilePath))
                    {
                        await templateStream.CopyToAsync(fileStream, cancellationToken);
                    }
                }

                if (templateExtension == ".docx")
                {
                    using (var document = WordprocessingDocument.Open(tempFilePath, true))
                    {
                        var body = document.MainDocumentPart!.Document.Body;
                        WordTemplateReplacer.ReplaceContentControls(body, replacements);
                        WordTemplateReplacer.PopulateTableAtBookmark(body, "assetsTable", assets);
                        WordTemplateReplacer.PopulateRichTextList(body, "finding", findings);
                        document.MainDocumentPart.Document.Save();
                    }
                }
                else if (templateExtension is ".md" or ".typ" or ".typst")
                {
                    var templateContent = await System.IO.File.ReadAllTextAsync(tempFilePath, cancellationToken);
                    var template = Template.Parse(templateContent);
                    if (template.HasErrors)
                    {
                        foreach (var error in template.Messages)
                        {
                            logger.LogWarning("{Message} {Start} {End}", error.Message, error.Span.Start, error.Span.End);
                        }
                        return;
                    }
                    var renderedTemplate = await template.RenderAsync(new { project });
                    await System.IO.File.WriteAllTextAsync(tempFilePath, renderedTemplate, cancellationToken);
                }
                else
                {
                    logger.LogWarning("Unsupported template extension: {Extension}", templateExtension);
                    return;
                }

                await using (var resultStream = System.IO.File.OpenRead(tempFilePath))
                {
                    await attachmentStorage.SaveFileAsync(reportFileName, resultStream);
                }

                var attachment = new Attachment
                {
                    ParentType = "report",
                    ParentId = report.Id,
                    CreatedByUid = report.CreatedByUid,
                    FileName = reportFileName,
                    FileMimeType = templateAttachment.FileMimeType,
                    ClientFileName = clientFileName,
                    FileSize = (uint)new FileInfo(tempFilePath).Length,
                    FileHash = await attachmentStorage.GetFileHashAsync(reportFileName)
                };

                dbContext.Attachments.Add(attachment);
                
                var notification = new Notification
                {
                    ToUserId = job.CreatedByUserId,
                    Title = "Report generated",
                    Content = $"The report for project '{project.Name}' was successfully generated.",
                    Status = "unread"
                };
                dbContext.Notifications.Add(notification);
                
                await dbContext.SaveChangesAsync(cancellationToken);

                logger.LogInformation("Successfully generated report {ReportId} for project {ProjectId}", job.ReportId, job.ProjectId);

                // Publish update notifications
                await messageQueue.PublishAsync("notifications", new { type = "message" });
            }
            finally
            {
                if (System.IO.File.Exists(tempFilePath))
                {
                    System.IO.File.Delete(tempFilePath);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to generate report {ReportId} for project {ProjectId}", job.ReportId, job.ProjectId);
        }
    }
}

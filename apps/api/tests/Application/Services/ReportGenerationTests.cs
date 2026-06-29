using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using api_v2.Application.Services;
using api_v2.Common.Messaging;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace tests.Application.Services;

public class ReportGenerationTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private class MockMessageQueue : IMessageQueue
    {
        public List<(string QueueName, object? Message)> Published { get; } = new();

        public Task PublishAsync<T>(string queueName, T message)
        {
            Published.Add((queueName, message));
            return Task.CompletedTask;
        }

        public Task SubscribeAsync<T>(string queueName, Func<T, Task> handler, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    private class MockAttachmentStorage : IAttachmentStorage
    {
        public List<string> DeletedFiles { get; } = new();
        public Task<Stream> GetFileStreamAsync(string fileName) => Task.FromResult<Stream>(new MemoryStream());
        public Task SaveFileAsync(string fileName, Stream stream) => Task.CompletedTask;
        public Task DeleteFileAsync(string fileName)
        {
            DeletedFiles.Add(fileName);
            return Task.CompletedTask;
        }
        public Task<string> GetFileHashAsync(string fileName) => Task.FromResult("hash");
    }

    private class MockMailSettingsService : IMailSettingsService
    {
        public Task<MailSettingsResponse> GetAsync(CancellationToken cancellationToken = default) => Task.FromResult(new MailSettingsResponse());
        public Task<MailSettingsResponse> UpdateAsync(MailSettingsUpdateRequest request, CancellationToken cancellationToken = default) => Task.FromResult(new MailSettingsResponse());
        public Task<SmtpDeliverySettings> GetSmtpSettingsAsync(CancellationToken cancellationToken = default) => Task.FromResult(new SmtpDeliverySettings
        {
            Host = "localhost",
            Port = 25,
            FromEmail = "sender@example.com"
        });
    }

    [Fact]
    public async Task Create_QueuesReportGenerationJob_AndReturnsAccepted()
    {
        // Arrange
        var db = CreateDbContext();
        
        var project = new Project { Id = 1, Name = "Test Project", Visibility = "public" };
        db.Projects.Add(project);
        
        var attachment = new Attachment 
        { 
            Id = 1, 
            ParentId = 10, // template ID
            ParentType = "report", 
            FileName = "template.docx", 
            ClientFileName = "template.docx",
            FileHash = "hash" 
        };
        db.Attachments.Add(attachment);
        await db.SaveChangesAsync();

        var messageQueue = new MockMessageQueue();
        var storage = new MockAttachmentStorage();
        var mailService = new MockMailSettingsService();
        var logger = NullLogger<ReportsController>.Instance;

        var controller = new ReportsController(db, logger, storage, messageQueue, mailService);
        var httpContext = new DefaultHttpContext();
        httpContext.Items["DbUser"] = new User { Id = 42, Username = "admin" };
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var requestDto = new ReportRequestDto
        {
            ProjectId = 1,
            ReportTemplateId = 10,
            VersionName = "1.0",
            VersionDescription = "Initial Draft"
        };

        // Act
        var result = await controller.Create(requestDto);

        // Assert
        var acceptedResult = Assert.IsType<AcceptedAtActionResult>(result);
        var returnedReport = Assert.IsType<Report>(acceptedResult.Value);
        Assert.Equal("1.0", returnedReport.VersionName);

        // Verify report record saved
        var dbReport = await db.Reports.FirstOrDefaultAsync(r => r.Id == returnedReport.Id);
        Assert.NotNull(dbReport);
        Assert.Equal("1.0", dbReport.VersionName);

        // Verify background job published
        Assert.Single(messageQueue.Published);
        var publishedJob = messageQueue.Published[0];
        Assert.Equal("report-generation", publishedJob.QueueName);
        
        var jobPayload = Assert.IsType<ReportGenerationJob>(publishedJob.Message);
        Assert.Equal(dbReport.Id, jobPayload.ReportId);
        Assert.Equal(1u, jobPayload.ProjectId);
        Assert.Equal(10u, jobPayload.ReportTemplateId);
        Assert.Equal(42u, jobPayload.CreatedByUserId);
    }

    [Fact]
    public async Task CreateTemplate_SavesTemplateAndAttachment_AndReturnsCreated()
    {
        // Arrange
        var db = CreateDbContext();
        var messageQueue = new MockMessageQueue();
        var storage = new MockAttachmentStorage();
        var mailService = new MockMailSettingsService();
        var logger = NullLogger<ReportsController>.Instance;

        var controller = new ReportsController(db, logger, storage, messageQueue, mailService);
        var httpContext = new DefaultHttpContext();
        httpContext.Items["DbUser"] = new User { Id = 42, Username = "admin" };
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var fileStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes("fake file content"));
        var resultFile = new FormFile(fileStream, 0, fileStream.Length, "resultFile", "template.docx")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };

        var templateDto = new ReportTemplateUploadDto
        {
            VersionName = "v2.0",
            VersionDescription = "Clean template",
            ResultFile = resultFile
        };

        // Act
        var result = await controller.CreateTemplate(templateDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var returnedReport = Assert.IsType<Report>(createdResult.Value);
        Assert.Equal("v2.0", returnedReport.VersionName);
        Assert.True(returnedReport.IsTemplate);

        // Verify database records
        var dbReport = await db.Reports.FirstOrDefaultAsync(r => r.Id == returnedReport.Id);
        Assert.NotNull(dbReport);
        Assert.Equal("v2.0", dbReport.VersionName);
        Assert.True(dbReport.IsTemplate);

        var dbAttachment = await db.Attachments.FirstOrDefaultAsync(a => a.ParentId == dbReport.Id && a.ParentType == "report");
        Assert.NotNull(dbAttachment);
        Assert.Equal("template.docx", dbAttachment.ClientFileName);
    }

    [Fact]
    public async Task DeleteOne_RemovesReportAndAssociatedAttachments()
    {
        // Arrange
        var db = CreateDbContext();
        
        var report = new Report { Id = 101, VersionName = "Template to Delete", IsTemplate = true };
        db.Reports.Add(report);
        
        var attachment = new Attachment
        {
            Id = 500,
            ParentId = 101,
            ParentType = "report",
            FileName = "secret_report.docx",
            ClientFileName = "secret_report.docx",
            FileHash = "hash"
        };
        db.Attachments.Add(attachment);
        await db.SaveChangesAsync();

        var messageQueue = new MockMessageQueue();
        var storage = new MockAttachmentStorage();
        var mailService = new MockMailSettingsService();
        var logger = NullLogger<ReportsController>.Instance;

        var controller = new ReportsController(db, logger, storage, messageQueue, mailService);
        var httpContext = new DefaultHttpContext();
        httpContext.Items["DbUser"] = new User { Id = 42, Username = "admin" };
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Act
        var result = await controller.DeleteOne(101);

        // Assert
        Assert.IsType<NoContentResult>(result);

        // Verify database
        var dbReport = await db.Reports.FindAsync(101u);
        Assert.Null(dbReport);

        var dbAttachment = await db.Attachments.FindAsync(500u);
        Assert.Null(dbAttachment);

        // Verify storage
        Assert.Contains("secret_report.docx", storage.DeletedFiles);
    }
}

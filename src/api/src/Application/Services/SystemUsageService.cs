using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace api_v2.Application.Services;

public class SystemUsageService(AppDbContext db, IConnectionMultiplexer redis)
{
    public async Task<object> GetUsageAsync()
    {
        // EF aggregates
        var totalCount = await db.Attachments.CountAsync();
        var totalFileSize = await db.Attachments
            .SumAsync(a => (long?)a.FileSize) ?? 0;

        // Redis queue lengths
        var db0 = redis.GetDatabase();
        var emails = await db0.ListLengthAsync("email:queue");
        var tasks = await db0.ListLengthAsync("tasks:queue");
        var notifications = await db0.ListLengthAsync("notifications:queue");

        return new
        {
            attachments = new
            {
                total_count = totalCount,
                total_file_size = totalFileSize
            },
            queueLengths = new
            {
                emails,
                tasks,
                notifications
            }
        };
    }
}
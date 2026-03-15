using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;

namespace api_v2.Application.Services;

public interface IAuditService
{
    Task RecordAsync(
        AuditEntry entry,
        CancellationToken cancellationToken = default);
}

public sealed class AuditService(AppDbContext db) : IAuditService
{
    public async Task RecordAsync(
        AuditEntry entry,
        CancellationToken cancellationToken = default)
    {
        db.AuditEntries.Add(entry);
        await db.SaveChangesAsync(cancellationToken);
    }
}

using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Application.Services;

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

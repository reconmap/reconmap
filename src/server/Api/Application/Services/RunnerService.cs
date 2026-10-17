using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Application.Services;

public interface IRunnerService
{
    Task<List<Runner>> GetManyAsync(CancellationToken cancellationToken = default);
}

public sealed class RunnerService(AppDbContext db) : IRunnerService
{
    public Task<List<Runner>> GetManyAsync(CancellationToken cancellationToken = default)
    {
        return db.Runners.AsNoTracking()
            .OrderByDescending(a => a.LastPingAt)
            .ToListAsync(cancellationToken);
    }
}

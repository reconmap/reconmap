using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Application.Services;

/// <param name="VisibleProjectIds">Only findings of these projects. Null means no restriction.</param>
public sealed record FindingFilter(
    Guid? ProjectId = null,
    Guid? AssetId = null,
    string? Status = null,
    string? Risk = null,
    string? Keywords = null,
    bool? IsTemplate = null,
    IReadOnlyCollection<Guid>? VisibleProjectIds = null);

public interface IFindingService
{
    Task<PagedResult<Finding>> GetManyAsync(FindingFilter filter, Paging paging, CancellationToken cancellationToken = default);
    Task<Finding?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed class FindingService(AppDbContext db) : IFindingService
{
    public async Task<PagedResult<Finding>> GetManyAsync(FindingFilter filter, Paging paging, CancellationToken cancellationToken = default)
    {
        var kw = filter.Keywords?.Trim().ToLower();

        var q = db.Findings
            .Include(v => v.Project)
            .Include(v => v.Asset)
            .AsNoTracking()
            .Where(v => string.IsNullOrEmpty(filter.Risk) || v.Risk == filter.Risk)
            .Where(v => !filter.IsTemplate.HasValue || v.IsTemplate == filter.IsTemplate)
            .Where(v => string.IsNullOrEmpty(kw)
                || v.Summary.ToLower().Contains(kw)
                || (v.Description != null && v.Description.ToLower().Contains(kw)));
        if (filter.VisibleProjectIds != null)
            q = q.Where(v => v.ProjectId.HasValue && filter.VisibleProjectIds.Contains(v.ProjectId.Value));
        if (filter.ProjectId.HasValue)
            q = q.Where(v => v.ProjectId == filter.ProjectId);
        if (filter.AssetId.HasValue)
            q = q.Where(v => v.AssetId == filter.AssetId);
        if (!string.IsNullOrWhiteSpace(filter.Status))
            q = q.Where(v => v.Status == filter.Status);
        q = q.OrderByDescending(a => a.CreatedAt).ThenByDescending(a => a.Id);

        var totalCount = await q.CountAsync(cancellationToken);
        var data = await q.Skip(paging.Offset).Take(paging.Limit).ToListAsync(cancellationToken);

        return new PagedResult<Finding>(data, totalCount);
    }

    public Task<Finding?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => db.Findings.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
}

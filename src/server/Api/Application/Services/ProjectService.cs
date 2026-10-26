using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Application.Services;

/// <param name="MemberOfUserId">Only projects the given user is a member of.</param>
/// <param name="VisibleProjectIds">Only these projects. Null means no restriction.</param>
public sealed record ProjectFilter(
    string? Status = null,
    string? Keywords = null,
    bool? IsTemplate = null,
    int? ClientId = null,
    int? MemberOfUserId = null,
    IReadOnlyCollection<Guid>? VisibleProjectIds = null);

public interface IProjectService
{
    Task<PagedResult<Project>> GetManyAsync(ProjectFilter filter, Paging paging, CancellationToken cancellationToken = default);
    Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<PagedResult<Project>> GetManyAsync(ProjectFilter filter, Paging paging, CancellationToken cancellationToken = default)
    {
        var kw = filter.Keywords?.Trim().ToLower();

        var q = db.Projects
            .Include(p => p.Client)
            .Include(p => p.Category)
            .AsNoTracking()
            .Where(p => !filter.IsTemplate.HasValue || p.IsTemplate == filter.IsTemplate)
            .Where(p => string.IsNullOrEmpty(kw)
                || p.Name.ToLower().Contains(kw)
                || (p.Description != null && p.Description.ToLower().Contains(kw)));

        if (filter.MemberOfUserId != null)
        {
            var memberProjectIds = db.ProjectMembers.Where(pm => pm.UserId == filter.MemberOfUserId).Select(pm => pm.ProjectId);
            q = q.Where(p => memberProjectIds.Contains(p.Id));
        }

        if (filter.VisibleProjectIds != null)
            q = q.Where(p => filter.VisibleProjectIds.Contains(p.Id));
        if (filter.ClientId != null)
            q = q.Where(p => p.ClientId == filter.ClientId);
        if (!string.IsNullOrEmpty(filter.Status))
            q = q.Where(p => p.Archived == (filter.Status == "archived"));
        q = q.OrderByDescending(a => a.CreatedAt);

        var totalCount = await q.CountAsync(cancellationToken);
        var data = await q.Skip(paging.Offset).Take(paging.Limit).ToListAsync(cancellationToken);
        await FillTaskCountsAsync(data, cancellationToken);

        return new PagedResult<Project>(data, totalCount);
    }

    private async Task FillTaskCountsAsync(List<Project> projects, CancellationToken cancellationToken)
    {
        if (projects.Count == 0) return;

        var projectIds = projects.Select(p => p.Id).ToList();
        var counts = await db.Tasks
            .AsNoTracking()
            .Where(t => projectIds.Contains(t.ProjectId))
            .GroupBy(t => t.ProjectId)
            .Select(g => new
            {
                ProjectId = g.Key,
                NumTasks = g.Count(),
                NumCompletedTasks = g.Count(t => t.Status == "done")
            })
            .ToDictionaryAsync(c => c.ProjectId, cancellationToken);

        foreach (var project in projects)
        {
            if (!counts.TryGetValue(project.Id, out var count)) continue;

            project.NumTasks = count.NumTasks;
            project.NumCompletedTasks = count.NumCompletedTasks;
        }
    }

    public Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return db.Projects
            .Include(p => p.CreatedBy)
            .Include(p => p.Category)
            .Include(p => p.Client)
            .Where(p => p.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }
}

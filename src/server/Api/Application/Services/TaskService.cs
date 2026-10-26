using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Application.Services;

/// <param name="ProjectIsArchived">0 keeps tasks from non-archived projects, any other value only tasks from archived projects.</param>
/// <param name="VisibleProjectIds">Only tasks of these projects. Null means no restriction.</param>
public sealed record TaskFilter(
    int? Limit = null,
    Guid? ProjectId = null,
    string? Priority = null,
    string? Status = null,
    string? Keywords = null,
    int? AssignedToId = null,
    int? ProjectIsArchived = null,
    IReadOnlyCollection<Guid>? VisibleProjectIds = null);

public interface ITaskService
{
    Task<List<ProjectTask>> GetManyAsync(TaskFilter filter, CancellationToken cancellationToken = default);
}

public sealed class TaskService(AppDbContext db) : ITaskService
{
    public Task<List<ProjectTask>> GetManyAsync(TaskFilter filter, CancellationToken cancellationToken = default)
    {
        var kw = filter.Keywords?.Trim().ToLower();

        var q = db.Tasks
            .Include(t => t.AssignedTo)
            .AsNoTracking()
            .Where(t => string.IsNullOrEmpty(filter.Priority) || t.Priority == filter.Priority)
            .Where(t => string.IsNullOrEmpty(filter.Status) || t.Status == filter.Status)
            .Where(t => string.IsNullOrEmpty(kw)
                || t.Summary.ToLower().Contains(kw)
                || (t.Description != null && t.Description.ToLower().Contains(kw)));
        if (filter.VisibleProjectIds != null)
            q = q.Where(t => filter.VisibleProjectIds.Contains(t.ProjectId));
        if (filter.ProjectId != null)
            q = q.Where(t => t.ProjectId == filter.ProjectId);
        if (filter.AssignedToId != null)
            q = q.Where(t => t.AssignedToId == filter.AssignedToId);
        if (filter.ProjectIsArchived != null)
        {
            var archivedProjectIds = db.Projects.Where(p => p.Archived).Select(p => p.Id);
            q = filter.ProjectIsArchived == 0
                ? q.Where(t => !archivedProjectIds.Contains(t.ProjectId))
                : q.Where(t => archivedProjectIds.Contains(t.ProjectId));
        }
        q = q.OrderByDescending(a => a.CreatedAt);
        if (filter.Limit != null)
            q = q.Take(filter.Limit.Value);

        return q.ToListAsync(cancellationToken);
    }
}

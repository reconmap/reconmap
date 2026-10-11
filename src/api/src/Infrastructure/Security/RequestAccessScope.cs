using api_v2.Common.Extensions;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Infrastructure.Security;

/// <summary>
/// Resolves tenant access from the authenticated database user.  Controllers must
/// use this service when a route does not carry a project id for OPA to evaluate.
/// </summary>
public interface IRequestAccessScope
{
    bool IsPrivileged { get; }
    bool CanAccessVault { get; }
    int UserId { get; }
    Task<IReadOnlyList<int>> MemberProjectIdsAsync(CancellationToken cancellationToken = default);
    Task<bool> CanAccessProjectAsync(int? projectId, CancellationToken cancellationToken = default);
    Task<bool> CanAccessSecretAsync(Secret secret, CancellationToken cancellationToken = default);
    Task<bool> CanAccessParentAsync(string parentType, int parentId, CancellationToken cancellationToken = default);
}

public sealed class RequestAccessScope(AppDbContext db, IHttpContextAccessor httpContextAccessor) : IRequestAccessScope
{
    private const string MemberProjectsKey = "AccessScope.MemberProjectIds";

    private User CurrentUser => httpContextAccessor.HttpContext?.GetCurrentUser()
        ?? throw new UnauthorizedAccessException("No authenticated database user is available.");

    public int UserId => CurrentUser.Id;
    public bool IsPrivileged => CurrentUser.Role is UserRole.Administrator or UserRole.Superuser;
    public bool CanAccessVault => IsPrivileged || CurrentUser.Role == UserRole.User;

    public async Task<IReadOnlyList<int>> MemberProjectIdsAsync(CancellationToken cancellationToken = default)
    {
        var items = httpContextAccessor.HttpContext?.Items;
        if (items != null && items.TryGetValue(MemberProjectsKey, out var cached) && cached is List<int> projectIds)
            return projectIds;

        var result = await db.ProjectMembers.Where(pm => pm.UserId == UserId)
            .Select(pm => pm.ProjectId).ToListAsync(cancellationToken);
        if (items != null) items[MemberProjectsKey] = result;
        return result;
    }

    public async Task<bool> CanAccessProjectAsync(int? projectId, CancellationToken cancellationToken = default)
    {
        if (IsPrivileged) return true;
        return projectId.HasValue && (await MemberProjectIdsAsync(cancellationToken)).Contains(projectId.Value);
    }

    public async Task<bool> CanAccessSecretAsync(Secret secret, CancellationToken cancellationToken = default)
    {
        if (IsPrivileged) return true;
        // Clients do not have vault access; users can access personal or assigned-project secrets.
        if (!CanAccessVault) return false;
        return secret.OwnerUid == UserId || await CanAccessProjectAsync(secret.ProjectId, cancellationToken);
    }

    public async Task<bool> CanAccessParentAsync(string parentType, int parentId, CancellationToken cancellationToken = default)
    {
        if (IsPrivileged) return true;

        int? projectId = parentType.Trim().ToLowerInvariant() switch
        {
            "project" => parentId,
            "task" => await db.Tasks.Where(x => x.Id == parentId).Select(x => (int?)x.ProjectId).FirstOrDefaultAsync(cancellationToken),
            "vulnerability" => await db.Vulnerabilities.Where(x => x.Id == parentId).Select(x => x.ProjectId).FirstOrDefaultAsync(cancellationToken),
            "report" => await db.Reports.Where(x => x.Id == parentId && !x.IsTemplate).Select(x => x.ProjectId).FirstOrDefaultAsync(cancellationToken),
            _ => null
        };

        return await CanAccessProjectAsync(projectId, cancellationToken);
    }
}

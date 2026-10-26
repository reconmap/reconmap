using ModelContextProtocol;
using Reconmap.Api.Common.Extensions;
using Reconmap.Api.Infrastructure.Security;

namespace Reconmap.McpServer.Security;

/// <summary>
/// Applies the same access rules as the REST API to MCP tools and resources:
/// administrators and superusers see everything, everybody else only sees the
/// projects they are a member of, and OPA stays the source of truth for
/// per-resource decisions.
/// </summary>
public class McpAccessGuard(
    IRequestAccessScope accessScope,
    OpaAuthorizationService opa,
    IHttpContextAccessor httpContextAccessor)
{
    public virtual bool IsPrivileged => accessScope.IsPrivileged;

    /// <summary>
    /// Returns null when the caller can see every project, otherwise the ids of the projects they may see.
    /// </summary>
    public virtual async Task<IReadOnlyList<Guid>?> VisibleProjectIdsAsync(CancellationToken ct = default)
    {
        RequireUser();
        return accessScope.IsPrivileged ? null : await accessScope.MemberProjectIdsAsync(ct);
    }

    /// <summary>
    /// Throws unless OPA allows a read of the given resource type within the given project.
    /// </summary>
    public virtual async Task RequireReadAsync(string resourceType, Guid? projectId, Guid? resourceId = null,
        CancellationToken ct = default)
    {
        var user = RequireUser();
        var memberProjectIds = (await accessScope.MemberProjectIdsAsync(ct)).ToList();

        var allowed = await opa.AuthorizeAsync(user, "GET", resourceType,
            new { type = resourceType, project_id = projectId, id = resourceId }, memberProjectIds);

        // Non-privileged users never reach data outside their projects, even if the policy is permissive.
        if (!allowed || !await accessScope.CanAccessProjectAsync(projectId, ct))
            throw new McpException("Access denied.");
    }

    /// <summary>
    /// Throws unless the caller is an administrator or superuser.
    /// </summary>
    public virtual void RequirePrivileged()
    {
        RequireUser();
        if (!accessScope.IsPrivileged)
            throw new McpException("Access denied.");
    }

    private Reconmap.Api.Domain.Entities.User RequireUser()
    {
        var user = httpContextAccessor.HttpContext?.GetCurrentUser();
        if (user is not { Active: true })
            throw new McpException("Authentication required.");
        return user;
    }
}

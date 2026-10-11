using api_v2.Domain.Identity;

namespace api_v2.Infrastructure.Keycloak;

public sealed record KeycloakUserInput(
    string Username,
    string Email,
    string FirstName,
    string LastName,
    string RoleGroup,
    string? Locale,
    string? TimeZone);

/// <summary>Only the fields that are set are changed in Keycloak.</summary>
public sealed record KeycloakUserUpdate(
    string? Username = null,
    string? Email = null,
    string? FirstName = null,
    string? LastName = null,
    bool? Enabled = null,
    string? Locale = null,
    string? TimeZone = null);

public sealed record KeycloakLoginInfo(bool MfaEnabled, DateTime? LastLoginAt);

public interface IKeycloakUserDirectory
{
    Task<KeycloakUser?> GetAsync(string subjectId, CancellationToken ct = default);

    /// <summary>
    /// Looks up many users in one go. Users that cannot be read are left out
    /// of the result, so a Keycloak outage degrades the response instead of failing it.
    /// </summary>
    Task<IReadOnlyDictionary<string, KeycloakUser>> GetManyAsync(IEnumerable<string> subjectIds, CancellationToken ct = default);

    Task<KeycloakLoginInfo> GetLoginInfoAsync(string subjectId, CancellationToken ct = default);

    /// <summary>Creates the user and returns its Keycloak subject id.</summary>
    Task<string> CreateAsync(KeycloakUserInput input, CancellationToken ct = default);

    Task UpdateAsync(string subjectId, KeycloakUserUpdate update, CancellationToken ct = default);

    /// <summary>
    /// Adds a Keycloak required action (for example <c>CONFIGURE_TOTP</c>) so the user is asked
    /// to complete it at the next login. Keycloak does not let admins create OTP credentials directly.
    /// </summary>
    Task AddRequiredActionAsync(string subjectId, string requiredAction, CancellationToken ct = default);

    /// <summary>Replaces the role group membership so the user belongs to <paramref name="roleGroup"/> only.</summary>
    Task SetRoleGroupAsync(string subjectId, string roleGroup, CancellationToken ct = default);

    Task DeleteAsync(string subjectId, CancellationToken ct = default);
}

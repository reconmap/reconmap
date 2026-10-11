namespace api_v2.Domain.Identity;

/// <summary>
/// Identity data for a user, as stored in Keycloak. Reconmap keeps only its own
/// data in the user table and fills these fields in when a response is built.
/// </summary>
public sealed record KeycloakUser(
    string SubjectId,
    string Username,
    string Email,
    string FirstName,
    string LastName,
    bool Enabled,
    DateTime? CreatedAt,
    string? Locale,
    string? TimeZone,
    DateTime? UpdatedAt);

/// <summary>
/// An entity that references a Keycloak user by its subject id and can have its
/// identity fields filled in from Keycloak.
/// </summary>
public interface IKeycloakIdentity
{
    string? SubjectId { get; }

    void ApplyKeycloakUser(KeycloakUser user);
}

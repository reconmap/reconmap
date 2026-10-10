using api_v2.Domain.Identity;
using api_v2.Infrastructure.Authentication;
using FS.Keycloak.RestApiClient.Api;
using FS.Keycloak.RestApiClient.Authentication.ClientFactory;
using FS.Keycloak.RestApiClient.Authentication.Flow;
using FS.Keycloak.RestApiClient.ClientFactory;
using FS.Keycloak.RestApiClient.Model;
using Microsoft.Extensions.Options;

namespace api_v2.Infrastructure.Keycloak;

/// <summary>
/// Reads and writes user identity in Keycloak. Reads are cached in Redis for a short
/// time, and every write evicts the cached entries for that user.
/// </summary>
public sealed class KeycloakUserDirectory(
    IOptions<KeycloakOptions> options,
    IKeycloakUserCache cache,
    ILogger<KeycloakUserDirectory> logger) : IKeycloakUserDirectory
{
    private const string TimeZoneAttribute = "timezone";
    private const string LocaleAttribute = "locale";
    private const string UpdatedAtAttribute = "updatedAt";
    public const string SystemSubjectId = "NULL";

    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(60);

    private KeycloakOptions Keycloak => options.Value;

    public async Task<KeycloakUser?> GetAsync(string subjectId, CancellationToken ct = default)
    {
        var result = await GetManyAsync([subjectId], ct);
        return result.GetValueOrDefault(subjectId);
    }

    public async Task<IReadOnlyDictionary<string, KeycloakUser>> GetManyAsync(IEnumerable<string> subjectIds, CancellationToken ct = default)
    {
        var ids = subjectIds
            .Where(id => !string.IsNullOrWhiteSpace(id) && id != SystemSubjectId)
            .Distinct()
            .ToList();

        var found = new Dictionary<string, KeycloakUser>();
        var missing = new List<string>();

        foreach (var id in ids)
        {
            var cached = await cache.GetAsync<KeycloakUser>(UserKey(id));
            if (cached != null) found[id] = cached;
            else missing.Add(id);
        }

        if (missing.Count == 0) return found;

        using var session = OpenSession();
        foreach (var id in missing)
        {
            try
            {
                var representation = await session.Users.GetUsersByUserIdAsync(Keycloak.Realm, id, cancellationToken: ct);
                var user = ToKeycloakUser(representation);
                found[id] = user;
                await cache.SetAsync(UserKey(id), user, CacheTtl);
            }
            catch (Exception e) when (e is not OperationCanceledException)
            {
                logger.LogWarning(e, "Could not read Keycloak user {SubjectId}", id);
            }
        }

        return found;
    }

    public async Task<KeycloakLoginInfo> GetLoginInfoAsync(string subjectId, CancellationToken ct = default)
    {
        var cached = await cache.GetAsync<KeycloakLoginInfo>(LoginKey(subjectId));
        if (cached != null) return cached;

        using var session = OpenSession();

        var credentials = await session.Users.GetUsersCredentialsByUserIdAsync(Keycloak.Realm, subjectId, cancellationToken: ct);
        var mfaEnabled = credentials.Any(c => c.Type == "otp");

        var events = await session.Realms.GetEventsAsync(Keycloak.Realm, type: ["LOGIN"], user: subjectId, max: 1, cancellationToken: ct);
        var lastLogin = events.FirstOrDefault()?.Time is long millis
            ? DateTimeOffset.FromUnixTimeMilliseconds(millis).UtcDateTime
            : (DateTime?)null;

        var info = new KeycloakLoginInfo(mfaEnabled, lastLogin);
        await cache.SetAsync(LoginKey(subjectId), info, CacheTtl);
        return info;
    }

    public async Task<string> CreateAsync(KeycloakUserInput input, CancellationToken ct = default)
    {
        using var session = OpenSession();

        var attributes = new Dictionary<string, List<string>>
        {
            [UpdatedAtAttribute] = [DateTime.UtcNow.ToString("O")]
        };
        if (!string.IsNullOrWhiteSpace(input.TimeZone)) attributes[TimeZoneAttribute] = [input.TimeZone];
        if (!string.IsNullOrWhiteSpace(input.Locale)) attributes[LocaleAttribute] = [input.Locale];

        await session.Users.PostUsersAsync(Keycloak.Realm, new UserRepresentation
        {
            FirstName = input.FirstName,
            LastName = input.LastName,
            Email = input.Email,
            Enabled = true,
            Username = input.Username,
            RequiredActions = ["UPDATE_PASSWORD"],
            Groups = [input.RoleGroup],
            Attributes = attributes
        }, cancellationToken: ct);

        var created = await session.Users.GetUsersAsync(Keycloak.Realm, username: input.Username, exact: true, cancellationToken: ct);
        return created[0].Id;
    }

    public async Task UpdateAsync(string subjectId, KeycloakUserUpdate update, CancellationToken ct = default)
    {
        using var session = OpenSession();

        var representation = await session.Users.GetUsersByUserIdAsync(Keycloak.Realm, subjectId, cancellationToken: ct);

        representation.Username = update.Username ?? representation.Username;
        representation.Email = update.Email ?? representation.Email;
        representation.FirstName = update.FirstName ?? representation.FirstName;
        representation.LastName = update.LastName ?? representation.LastName;
        representation.Enabled = update.Enabled ?? representation.Enabled;

        representation.Attributes ??= new Dictionary<string, List<string>>();
        if (update.Locale != null) representation.Attributes[LocaleAttribute] = [update.Locale];
        if (update.TimeZone != null) representation.Attributes[TimeZoneAttribute] = [update.TimeZone];
        representation.Attributes[UpdatedAtAttribute] = [DateTime.UtcNow.ToString("O")];

        await session.Users.PutUsersByUserIdAsync(Keycloak.Realm, subjectId, representation, cancellationToken: ct);
        await InvalidateAsync(subjectId);
    }

    public async Task AddRequiredActionAsync(string subjectId, string requiredAction, CancellationToken ct = default)
    {
        using var session = OpenSession();

        var representation = await session.Users.GetUsersByUserIdAsync(Keycloak.Realm, subjectId, cancellationToken: ct);
        representation.RequiredActions ??= [];
        if (representation.RequiredActions.Contains(requiredAction)) return;

        representation.RequiredActions.Add(requiredAction);
        await session.Users.PutUsersByUserIdAsync(Keycloak.Realm, subjectId, representation, cancellationToken: ct);
        await InvalidateAsync(subjectId);
    }

    public async Task SetRoleGroupAsync(string subjectId, string roleGroup, CancellationToken ct = default)
    {
        using var session = OpenSession();

        var current = await session.Users.GetUsersGroupsByUserIdAsync(Keycloak.Realm, subjectId, cancellationToken: ct);
        foreach (var group in current.Where(g => RoleGroups.Contains(g.Name) && g.Name != roleGroup))
        {
            await session.Users.DeleteUsersGroupsByUserIdAndGroupIdAsync(Keycloak.Realm, subjectId, group.Id, cancellationToken: ct);
        }

        if (current.Any(g => g.Name == roleGroup)) return;

        var target = await session.Groups.GetGroupsAsync(Keycloak.Realm, search: roleGroup, exact: true, cancellationToken: ct);
        var groupId = target.Single(g => g.Name == roleGroup).Id;
        await session.Users.PutUsersGroupsByUserIdAndGroupIdAsync(Keycloak.Realm, subjectId, groupId, cancellationToken: ct);
    }

    public async Task DeleteAsync(string subjectId, CancellationToken ct = default)
    {
        using var session = OpenSession();
        await session.Users.DeleteUsersByUserIdAsync(Keycloak.Realm, subjectId, cancellationToken: ct);
        await InvalidateAsync(subjectId);
    }

    private static readonly string[] RoleGroups = ["administrator-group", "superuser-group", "user-group", "client-group"];

    private static KeycloakUser ToKeycloakUser(UserRepresentation representation)
    {
        var attributes = representation.Attributes;
        return new KeycloakUser(
            SubjectId: representation.Id,
            Username: representation.Username ?? string.Empty,
            Email: representation.Email ?? string.Empty,
            FirstName: representation.FirstName ?? string.Empty,
            LastName: representation.LastName ?? string.Empty,
            Enabled: representation.Enabled ?? false,
            CreatedAt: representation.CreatedTimestamp is long created
                ? DateTimeOffset.FromUnixTimeMilliseconds(created).UtcDateTime
                : null,
            Locale: FirstAttribute(attributes, LocaleAttribute),
            TimeZone: FirstAttribute(attributes, TimeZoneAttribute),
            UpdatedAt: DateTime.TryParse(FirstAttribute(attributes, UpdatedAtAttribute), null,
                System.Globalization.DateTimeStyles.RoundtripKind, out var updated)
                ? updated
                : null);
    }

    private static string? FirstAttribute(IDictionary<string, List<string>>? attributes, string name)
        => attributes != null && attributes.TryGetValue(name, out var values) ? values.FirstOrDefault() : null;

    private static string UserKey(string subjectId) => $"keycloak-user:{subjectId}";
    private static string LoginKey(string subjectId) => $"keycloak-login:{subjectId}";

    private Task InvalidateAsync(string subjectId)
        => cache.RemoveAsync(UserKey(subjectId), LoginKey(subjectId));

    private Session OpenSession()
    {
        var creds = new ClientCredentialsFlow
        {
            ClientId = Keycloak.ClientId,
            ClientSecret = Keycloak.ClientSecret,
            KeycloakUrl = Keycloak.KeycloakUrl,
            Realm = Keycloak.Realm
        };

        var httpClient = AuthenticationHttpClientFactory.Create(creds);
        return new Session(
            httpClient,
            ApiClientFactory.Create<UsersApi>(httpClient),
            ApiClientFactory.Create<GroupsApi>(httpClient),
            ApiClientFactory.Create<RealmsAdminApi>(httpClient));
    }

    private sealed class Session(HttpClient httpClient, UsersApi users, GroupsApi groups, RealmsAdminApi realms) : IDisposable
    {
        public UsersApi Users { get; } = users;
        public GroupsApi Groups { get; } = groups;
        public RealmsAdminApi Realms { get; } = realms;

        public void Dispose()
        {
            Users.Dispose();
            Groups.Dispose();
            Realms.Dispose();
            httpClient.Dispose();
        }
    }
}

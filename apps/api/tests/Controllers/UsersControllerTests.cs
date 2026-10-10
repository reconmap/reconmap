using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Domain.Identity;
using api_v2.Infrastructure.Authentication;
using api_v2.Infrastructure.Keycloak;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace tests.Controllers;

public class UsersControllerTests
{
    private const string Realm = "test-realm";

    private sealed record RecordedRequest(string Method, string Path, string Body);

    // Minimal stand-in for Keycloak: serves the token endpoint and the user endpoints
    // used by the API, and records every request so tests can assert on what was sent.
    private sealed class FakeKeycloak : IDisposable
    {
        private readonly HttpListener _listener = new();
        private readonly Task _loop;
        private readonly List<RecordedRequest> _requests = [];

        public string Url { get; }
        public IReadOnlyList<RecordedRequest> Requests => _requests;

        public FakeKeycloak()
        {
            var port = GetFreePort();
            Url = $"http://127.0.0.1:{port}";
            _listener.Prefixes.Add($"{Url}/");
            _listener.Start();
            _loop = Task.Run(ServeAsync);
        }

        private async Task ServeAsync()
        {
            while (_listener.IsListening)
            {
                HttpListenerContext ctx;
                try
                {
                    ctx = await _listener.GetContextAsync();
                }
                catch (Exception e) when (e is HttpListenerException or ObjectDisposedException)
                {
                    // Listener was stopped during Dispose.
                    return;
                }

                await HandleAsync(ctx);
            }
        }

        private const string ProfileJson =
            """{"id":"kc-user-1","username":"jdoe","email":"john@example.com","firstName":"John","lastName":"Doe","enabled":true,"createdTimestamp":1700000000000,"attributes":{"timezone":["Europe/Madrid"]}}""";

        private async Task HandleAsync(HttpListenerContext ctx)
        {
            var req = ctx.Request;
            var res = ctx.Response;
            var path = req.Url!.AbsolutePath;

            using var reader = new StreamReader(req.InputStream, Encoding.UTF8);
            var body = await reader.ReadToEndAsync();
            _requests.Add(new RecordedRequest(req.HttpMethod, path, body));

            if (req.HttpMethod == "POST" && path.EndsWith("/token"))
            {
                await WriteJsonAsync(res, HttpStatusCode.OK,
                    """{"access_token":"fake-token","expires_in":300,"token_type":"Bearer"}""");
            }
            else if (req.HttpMethod == "POST" && path == $"/admin/realms/{Realm}/users")
            {
                res.StatusCode = (int)HttpStatusCode.Created;
                res.Close();
            }
            else if (req.HttpMethod == "GET" && path == $"/admin/realms/{Realm}/users")
            {
                await WriteJsonAsync(res, HttpStatusCode.OK, """[{"id":"kc-user-id","username":"jdoe"}]""");
            }
            else if (req.HttpMethod == "GET" && path == $"/admin/realms/{Realm}/users/kc-user-1")
            {
                await WriteJsonAsync(res, HttpStatusCode.OK, ProfileJson);
            }
            else if ((req.HttpMethod == "PUT" || req.HttpMethod == "DELETE") && path == $"/admin/realms/{Realm}/users/kc-user-1")
            {
                res.StatusCode = (int)HttpStatusCode.NoContent;
                res.Close();
            }
            else
            {
                res.StatusCode = (int)HttpStatusCode.NotFound;
                res.Close();
            }
        }

        private static async Task WriteJsonAsync(HttpListenerResponse res, HttpStatusCode status, string json)
        {
            var bytes = Encoding.UTF8.GetBytes(json);
            res.StatusCode = (int)status;
            res.ContentType = "application/json";
            res.ContentLength64 = bytes.Length;
            await res.OutputStream.WriteAsync(bytes);
            res.Close();
        }

        private static int GetFreePort()
        {
            var listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            var port = ((IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            return port;
        }

        public void Dispose()
        {
            _listener.Stop();
            _listener.Close();
            try
            {
                _loop.Wait(TimeSpan.FromSeconds(5));
            }
            catch (AggregateException)
            {
                // Listener closed while waiting for a request; expected on shutdown.
            }
        }
    }

    private sealed class InMemoryKeycloakUserCache : IKeycloakUserCache
    {
        private readonly Dictionary<string, object> _values = [];

        public Task<T?> GetAsync<T>(string key) where T : class
            => Task.FromResult(_values.TryGetValue(key, out var value) ? (T)value : null);

        public Task SetAsync<T>(string key, T value, TimeSpan ttl) where T : class
        {
            _values[key] = value;
            return Task.CompletedTask;
        }

        public Task RemoveAsync(params string[] keys)
        {
            foreach (var key in keys) _values.Remove(key);
            return Task.CompletedTask;
        }
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static KeycloakOptions CreateOptions(string keycloakUrl) => new()
    {
        ClientId = "reconmap-client",
        ClientSecret = "secret",
        KeycloakUrl = keycloakUrl,
        Realm = Realm
    };

    private static KeycloakUserDirectory CreateDirectory(string keycloakUrl, IKeycloakUserCache cache)
        => new(Options.Create(CreateOptions(keycloakUrl)), cache, NullLogger<KeycloakUserDirectory>.Instance);

    private static UsersController CreateController(AppDbContext db, string keycloakUrl, int callerId = 1)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Loopback;
        httpContext.Items["DbUser"] = new User { Id = callerId, Role = UserRole.Administrator };

        var directory = CreateDirectory(keycloakUrl, new InMemoryKeycloakUserCache());

        return new UsersController(db, directory)
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };
    }

    [Theory]
    [InlineData(UserRole.Administrator, "administrator-group")]
    [InlineData(UserRole.Superuser, "superuser-group")]
    [InlineData(UserRole.User, "user-group")]
    [InlineData(UserRole.Client, "client-group")]
    public async Task CreatOne_SendsLowercaseRoleGroupToKeycloak(UserRole role, string expectedGroup)
    {
        using var keycloak = new FakeKeycloak();
        using var db = CreateDbContext();
        var controller = CreateController(db, keycloak.Url);

        var newUser = new User
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Username = "jdoe",
            Role = role
        };

        var result = await controller.CreatOne(newUser);

        Assert.IsType<CreatedAtActionResult>(result);
        var create = Assert.Single(keycloak.Requests, r => r.Method == "POST" && r.Path.EndsWith("/users"));

        using var body = JsonDocument.Parse(create.Body);
        var groups = body.RootElement.GetProperty("groups").EnumerateArray()
            .Select(g => g.GetString())
            .ToList();

        Assert.Equal([expectedGroup], groups);
        Assert.Equal("kc-user-id", newUser.SubjectId);
    }

    [Fact]
    public void CreatOne_ModelValidation_AcceptsPayloadWithoutSubjectId()
    {
        using var keycloak = new FakeKeycloak();
        using var db = CreateDbContext();
        var controller = CreateController(db, keycloak.Url);
        // Model validation runs through MVC's validator, which needs the MVC services.
        var services = new ServiceCollection().AddControllers().Services.BuildServiceProvider();
        controller.HttpContext.RequestServices = services;

        // The dashboard creates users without a subjectId: the API assigns it from Keycloak.
        var newUser = new User
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            Username = "jdoe",
            Role = UserRole.User
        };

        Assert.True(controller.TryValidateModel(newUser), string.Join("; ", controller.ModelState.Values
            .SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
    }

    [Fact]
    public async Task PatchOne_SendsIdentityFieldsToKeycloakAndAppFieldsToDatabase()
    {
        using var keycloak = new FakeKeycloak();
        using var db = CreateDbContext();
        db.Users.Add(new User { Id = 2, SubjectId = "kc-user-1", Role = UserRole.User });
        await db.SaveChangesAsync();
        var controller = CreateController(db, keycloak.Url, callerId: 2);

        using var patch = JsonDocument.Parse("""{"firstName":"Jane","shortBio":"Pentester","locale":"es"}""");
        var result = await controller.PatchOne(2, patch.RootElement);

        Assert.IsType<NoContentResult>(result);

        var put = Assert.Single(keycloak.Requests, r => r.Method == "PUT");
        using var sent = JsonDocument.Parse(put.Body);
        Assert.Equal("Jane", sent.RootElement.GetProperty("firstName").GetString());
        Assert.Equal("es", sent.RootElement.GetProperty("attributes").GetProperty("locale")[0].GetString());

        var stored = await db.Users.FindAsync(2);
        Assert.Equal("Pentester", stored!.ShortBio);
    }

    [Fact]
    public async Task PatchOne_RejectsLocaleTimezoneAndPreferences_WhenCallerIsNotTheOwner()
    {
        using var keycloak = new FakeKeycloak();
        using var db = CreateDbContext();
        db.Users.Add(new User { Id = 2, SubjectId = "kc-user-1", Role = UserRole.User });
        await db.SaveChangesAsync();
        // Caller is an administrator (id 1) who does not own profile 2.
        var controller = CreateController(db, keycloak.Url);

        foreach (var json in new[]
        {
            """{"locale":"es"}""",
            """{"timezone":"Europe/Madrid"}""",
            """{"preferences":{"dashboard.theme":"light"}}"""
        })
        {
            using var patch = JsonDocument.Parse(json);
            var result = await controller.PatchOne(2, patch.RootElement);

            Assert.IsType<ForbidResult>(result);
        }

        Assert.Empty(keycloak.Requests);
        Assert.Null((await db.Users.FindAsync(2))!.Preferences);
    }

    [Fact]
    public async Task PatchOne_LetsAdministratorsEditIdentityOfOtherUsers()
    {
        using var keycloak = new FakeKeycloak();
        using var db = CreateDbContext();
        db.Users.Add(new User { Id = 2, SubjectId = "kc-user-1", Role = UserRole.User });
        await db.SaveChangesAsync();
        var controller = CreateController(db, keycloak.Url);

        using var patch = JsonDocument.Parse("""{"firstName":"Jane","shortBio":"Pentester"}""");
        var result = await controller.PatchOne(2, patch.RootElement);

        Assert.IsType<NoContentResult>(result);
        Assert.Single(keycloak.Requests, r => r.Method == "PUT");
    }

    [Fact]
    public async Task PatchOne_RejectsMfaEnabled_WithoutCallingKeycloak()
    {
        using var keycloak = new FakeKeycloak();
        using var db = CreateDbContext();
        db.Users.Add(new User { Id = 2, SubjectId = "kc-user-1", Role = UserRole.User });
        await db.SaveChangesAsync();
        var controller = CreateController(db, keycloak.Url);

        using var patch = JsonDocument.Parse("""{"mfaEnabled":true}""");
        var result = await controller.PatchOne(2, patch.RootElement);

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Empty(keycloak.Requests);
    }

    [Fact]
    public async Task DeleteOne_RemovesUserFromKeycloakAndDatabase()
    {
        using var keycloak = new FakeKeycloak();
        using var db = CreateDbContext();
        db.Users.Add(new User { Id = 2, SubjectId = "kc-user-1", Role = UserRole.User });
        await db.SaveChangesAsync();
        var controller = CreateController(db, keycloak.Url);

        var result = await controller.DeleteOne(2);

        Assert.IsType<NoContentResult>(result);
        Assert.Single(keycloak.Requests, r => r.Method == "DELETE" && r.Path.EndsWith("/users/kc-user-1"));
        Assert.Empty(db.Users);
    }

    [Fact]
    public async Task Directory_ServesRepeatedReadsFromCache_UntilTheUserIsUpdated()
    {
        using var keycloak = new FakeKeycloak();
        var directory = CreateDirectory(keycloak.Url, new InMemoryKeycloakUserCache());

        var first = await directory.GetAsync("kc-user-1");
        var second = await directory.GetAsync("kc-user-1");

        Assert.Equal("jdoe", first!.Username);
        Assert.Equal("Europe/Madrid", second!.TimeZone);
        Assert.Equal(1, keycloak.Requests.Count(r => r.Method == "GET" && r.Path.EndsWith("/users/kc-user-1")));

        // UpdateAsync reads the user once itself, then the cached entry is evicted.
        await directory.UpdateAsync("kc-user-1", new KeycloakUserUpdate(FirstName: "Jane"));
        await directory.GetAsync("kc-user-1");

        Assert.Equal(3, keycloak.Requests.Count(r => r.Method == "GET" && r.Path.EndsWith("/users/kc-user-1")));
    }

    [Fact]
    public async Task EnrichmentFilter_FillsIdentityFieldsOfUsersInTheResponse()
    {
        using var keycloak = new FakeKeycloak();
        var directory = CreateDirectory(keycloak.Url, new InMemoryKeycloakUserCache());
        var filter = new KeycloakUserEnrichmentFilter(directory);

        var task = new UserInfo { Id = 7, SubjectId = "kc-user-1" };
        var response = new ObjectResult(new { Items = new[] { task } });
        var actionContext = new ActionContext(new DefaultHttpContext(), new RouteData(), new ActionDescriptor());
        var executing = new ResultExecutingContext(actionContext, [], response, new object());

        await filter.OnResultExecutionAsync(executing, () => Task.FromResult(
            new ResultExecutedContext(actionContext, [], response, new object())));

        Assert.Equal("jdoe", task.Username);
        Assert.Equal("John Doe", task.FullName);
    }
}

using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Authentication;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace tests.Controllers;

public class UsersControllerTests
{
    private const string Realm = "test-realm";

    // Minimal stand-in for Keycloak: serves the token endpoint, accepts user creation,
    // and returns the created user on lookup. Records every user creation body.
    private sealed class FakeKeycloak : IDisposable
    {
        private readonly HttpListener _listener = new();
        private readonly Task _loop;
        private readonly List<string> _createdUserBodies = [];

        public string Url { get; }
        public IReadOnlyList<string> CreatedUserBodies => _createdUserBodies;

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

        private async Task HandleAsync(HttpListenerContext ctx)
        {
            var req = ctx.Request;
            var res = ctx.Response;
            var path = req.Url!.AbsolutePath;

            if (req.HttpMethod == "POST" && path.EndsWith("/token"))
            {
                await WriteJsonAsync(res, HttpStatusCode.OK,
                    """{"access_token":"fake-token","expires_in":300,"token_type":"Bearer"}""");
            }
            else if (req.HttpMethod == "POST" && path == $"/admin/realms/{Realm}/users")
            {
                using var reader = new StreamReader(req.InputStream, Encoding.UTF8);
                _createdUserBodies.Add(await reader.ReadToEndAsync());
                res.StatusCode = (int)HttpStatusCode.Created;
                res.Close();
            }
            else if (req.HttpMethod == "GET" && path == $"/admin/realms/{Realm}/users")
            {
                await WriteJsonAsync(res, HttpStatusCode.OK, """[{"id":"kc-user-id","username":"jdoe"}]""");
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

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static UsersController CreateController(AppDbContext db, string keycloakUrl)
    {
        var keycloakOptions = Options.Create(new KeycloakOptions
        {
            ClientId = "reconmap-client",
            ClientSecret = "secret",
            KeycloakUrl = keycloakUrl,
            Realm = Realm
        });

        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Loopback;
        httpContext.Items["DbUser"] = new User { Id = 1, Username = "admin", Role = UserRole.Administrator };

        return new UsersController(db, keycloakOptions)
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
        Assert.Single(keycloak.CreatedUserBodies);

        using var body = JsonDocument.Parse(keycloak.CreatedUserBodies[0]);
        var groups = body.RootElement.GetProperty("groups").EnumerateArray()
            .Select(g => g.GetString())
            .ToList();

        Assert.Equal([expectedGroup], groups);
        Assert.Equal(expectedGroup, expectedGroup.ToLowerInvariant());
    }
}

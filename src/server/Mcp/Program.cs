using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Infrastructure.Authentication;
using Reconmap.Api.Infrastructure.Http;
using Reconmap.Api.Infrastructure.Keycloak;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Redis;
using Reconmap.Api.Infrastructure.Security;
using Reconmap.McpServer.Security;
using StackExchange.Redis;
using ModelContextProtocol.AspNetCore;
using ModelContextProtocol.AspNetCore.Authentication;
using ModelContextProtocol.Authentication;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory
});

// The CreateBuilder above automatically loads appsettings.json and appsettings.Environment.json
// from the ContentRootPath (which is now guaranteed to be the bin output folder where the files were copied).

var services = builder.Services;

services.AddDatabase(builder.Configuration);

services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>(name: "database")
    .AddRedis(sp => sp.GetRequiredService<IConnectionMultiplexer>(), name: "redis");

// Authentication: same schemes as the REST API (Keycloak JWT bearer and Reconmap API tokens).
services.AddHttpContextAccessor();
services.AddRedisServices(builder.Configuration);
services.AddSingleton<IKeycloakUserCache, RedisKeycloakUserCache>();
services.AddSingleton<IKeycloakUserDirectory, KeycloakUserDirectory>();
services.AddTransient<IClaimsTransformation, RoleClaimsTransformation>();
services.AddReconmapAuthentication(builder.Configuration, builder.Environment);

// OAuth for MCP clients: unauthenticated requests are answered with a 401 that points at the protected
// resource metadata (/.well-known/oauth-protected-resource), which in turn names Keycloak as the
// authorization server. Clients then run the OAuth flow against Keycloak and send the resulting JWT.
services.AddAuthentication()
    .AddMcp(options =>
    {
        options.Events.OnResourceMetadataRequest = context =>
        {
            var configuration = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var publicUrl = configuration["Mcp:PublicUrl"];
            var request = context.HttpContext.Request;
            var resource = string.IsNullOrWhiteSpace(publicUrl)
                ? $"{request.Scheme}://{request.Host}/mcp"
                : publicUrl.TrimEnd('/');

            context.ResourceMetadata = new ProtectedResourceMetadata
            {
                Resource = resource,
                ResourceName = "Reconmap MCP Server",
                AuthorizationServers = { configuration["Keycloak:ValidIssuer"]! },
                ScopesSupported = { "openid", "profile", "email" }
            };
            return Task.CompletedTask;
        };
    });
// Challenge through the MCP scheme so the 401 carries the resource_metadata hint. Only the JWT scheme forwards:
// the API token scheme does not add a WWW-Authenticate header, so the response has a single challenge.
services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme,
    options => options.ForwardChallenge = McpAuthenticationDefaults.AuthenticationScheme);

// Everything, including the MCP endpoint, requires an authenticated caller.
services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .AddAuthenticationSchemes("ApiToken", "Bearer")
        .RequireAuthenticatedUser()
        .Build());

// Authorization: same OPA policy and project-membership scope as the REST API.
services.AddHttpClient();
services.AddOpaAuthorization(builder.Configuration);
services.AddScoped<IRequestAccessScope, RequestAccessScope>();
services.AddScoped<McpAccessGuard>();

// Same services the REST controllers use, so the data logic lives in one place.
services.AddScoped<IProjectService, ProjectService>();
services.AddScoped<ITaskService, TaskService>();
services.AddScoped<IFindingService, FindingService>();
services.AddScoped<IRunnerService, RunnerService>();

// Add the MCP services with HTTP transport
services
    .AddMcpServer()
    .WithHttpTransport()
    .WithTools<Reconmap.McpServer.Tools.ProjectTools>()
    .WithResources<Reconmap.McpServer.Resources.ProjectResources>()
    .WithResources<Reconmap.McpServer.Resources.TaskResources>()
    .WithResources<Reconmap.McpServer.Resources.FindingResources>()
    .WithResources<Reconmap.McpServer.Resources.RunnerResources>()
    .WithPrompts<Reconmap.McpServer.Prompts.ReconmapPrompts>();

// Browser-based MCP clients (such as the MCP Inspector, which runs the OAuth discovery from the browser) need CORS.
// Only the configured origins may call the server: Mcp:AllowedOrigins, plus Cors:AllowedOrigins, plus the Inspector's
// default origins. Authentication is by bearer token, so credentials (cookies) are not allowed.
const string McpCorsPolicy = "McpClients";
var mcpOrigins = (builder.Configuration.GetSection("Mcp:AllowedOrigins").Get<string[]>() ?? [])
    .Concat(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
    .Concat(["http://localhost:6274", "http://127.0.0.1:6274"])
    .Distinct()
    .ToArray();
services.AddCors(options => options.AddPolicy(McpCorsPolicy, policy => policy
    .WithOrigins(mcpOrigins)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .WithExposedHeaders("WWW-Authenticate", "Mcp-Session-Id", "Mcp-Protocol-Version")));

var app = builder.Build();

app.UseCors(McpCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<DbUserResolverMiddleware>();

// Anonymous, like the REST API's /health, so the REST API and orchestrators can probe it.
app.MapHealthChecks("/health", new HealthCheckOptions { ResponseWriter = HealthCheckResponseWriter.WriteAsync })
    .AllowAnonymous();

// Map the MCP endpoint at /mcp (the SDK's default pattern is "/", which the docs do not use)
app.MapMcp("/mcp");

await app.RunAsync();

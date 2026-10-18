using System.Text.Json;
using System.Text.Json.Serialization;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Common;
using Reconmap.Api.Extensions;
using Reconmap.Api.Infrastructure.Authentication;
using Reconmap.Api.Infrastructure.Http;
using Reconmap.Api.Infrastructure.Persistence;
using Reconmap.Api.Infrastructure.Redis;
using Reconmap.Api.Infrastructure.Messaging;
using Reconmap.Api.Infrastructure.WebSockets;
using Amazon.S3;
using Reconmap.Api.Application.CommandParsers;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using Serilog;
using StackExchange.Redis;

var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
var isDevelopment = environmentName == "Development";
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", false, isDevelopment)
    .AddJsonFile($"appsettings.{environmentName}.json", true, isDevelopment).Build();

Console.Error.WriteLine("Reconmap API bootstrap: appsettings configuration loaded.");

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("ai-providers.json", optional: false, reloadOnChange: true);
Console.Error.WriteLine("Reconmap API bootstrap: web host builder created.");
builder.WebHost.ConfigureKestrel(serverOptions => { serverOptions.AddServerHeader = false; });
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .CreateLogger();
builder.Host.UseSerilog();

var startupDiagnostics = StartupDiagnostics.Create(builder.Configuration);
var startupDiagnosticMessage = string.Format(
    "API startup configuration: urls={0}; databaseHost={1}; redis={2}:{3}; rabbitMqHost={4}; keycloakHost={5}; storageHost={6}",
    startupDiagnostics.ListenerUrls, startupDiagnostics.DatabaseHost, startupDiagnostics.RedisHost,
    startupDiagnostics.RedisPort, startupDiagnostics.RabbitMqHost, startupDiagnostics.KeycloakHost,
    startupDiagnostics.StorageHost);
Console.Error.WriteLine($"Reconmap API bootstrap: {startupDiagnosticMessage}");
Log.Warning(
    "API startup configuration: urls={ListenerUrls}; databaseHost={DatabaseHost}; redis={RedisHost}:{RedisPort}; rabbitMqHost={RabbitMqHost}; keycloakHost={KeycloakHost}; storageHost={StorageHost}",
    startupDiagnostics.ListenerUrls, startupDiagnostics.DatabaseHost, startupDiagnostics.RedisHost,
    startupDiagnostics.RedisPort, startupDiagnostics.RabbitMqHost, startupDiagnostics.KeycloakHost,
    startupDiagnostics.StorageHost);
foreach (var validationError in startupDiagnostics.ValidationErrors)
    Log.Error("API startup configuration error: {ValidationError}", validationError);

var services = builder.Services;
services.Configure<StorageSettings>(builder.Configuration.GetSection("Storage"));

services.AddSingleton<IAmazonS3>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<StorageSettings>>().Value;
    var config = new AmazonS3Config
    {
        ServiceURL = settings.S3.Endpoint,
        ForcePathStyle = true
    };
    return new AmazonS3Client(settings.S3.AccessKey, settings.S3.SecretKey, config);
});

services.AddScoped<IAttachmentStorage, S3AttachmentStorage>();

var parserType = typeof(ICommandParser);
var parserTypes = typeof(Program).Assembly.GetTypes()
    .Where(t => parserType.IsAssignableFrom(t) && !t.IsAbstract && !t.IsInterface);
foreach (var type in parserTypes)
{
    services.AddScoped(type);
}

services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
services.AddSingleton<Reconmap.Api.Infrastructure.Keycloak.IKeycloakUserCache, Reconmap.Api.Infrastructure.Keycloak.RedisKeycloakUserCache>();
services.AddSingleton<Reconmap.Api.Infrastructure.Keycloak.IKeycloakUserDirectory, Reconmap.Api.Infrastructure.Keycloak.KeycloakUserDirectory>();

services.AddTransient<IClaimsTransformation, RoleClaimsTransformation>();
services.AddSingleton<WebSocketConnectionManager>();
services.AddSingleton<Reconmap.Api.Infrastructure.Sse.SseConnectionManager>();
services.AddScoped<SystemUsageService>();
services.AddScoped<IAuditService, AuditService>();
services.AddScoped<ISecretsService, SecretsService>();
services.AddScoped<IProjectService, ProjectService>();
services.AddScoped<ITaskService, TaskService>();
services.AddScoped<IVulnerabilityService, VulnerabilityService>();
services.AddScoped<IRunnerService, RunnerService>();
services.AddScoped<IMailSettingsService, MailSettingsService>();
services.Configure<AiProviderCatalogOptions>(builder.Configuration.GetSection("AiProviders"));
services.AddSingleton<IAiProviderCatalog, AiProviderCatalog>();
services.AddScoped<IAiSettingsService, AiSettingsService>();
services.AddDataProtection()
    .SetApplicationName("Reconmap");

services.AddScoped<IAiService, AiService>();
services.AddSingleton<IAiUsageRecorder, AiUsageRecorder>();
services.AddScoped<IAiChatClientFactory, AiChatClientFactory>();
services.AddScoped<IToolRecommendationService, ToolRecommendationService>();
services.AddHttpClient();
services.AddSingleton<McpHealthProbe>();
services.AddScoped<Reconmap.Api.Infrastructure.Security.OpaAuthorizationService>();
services.AddScoped<Reconmap.Api.Infrastructure.Security.IRequestAccessScope, Reconmap.Api.Infrastructure.Security.RequestAccessScope>();

services.AddRedisServices(builder.Configuration);
services.AddRabbitMQServices(builder.Configuration);
services.AddHostedService<CommandResultProcessor>();
services.AddHostedService<WebhookPublisher>();
services.AddHostedService<NotificationQueueListener>();
services.AddHostedService<JiraPublisher>();
services.AddHostedService<AzureDevopsPublisher>();
services.AddHostedService<ReportEmailProcessor>();
services.AddHostedService<ReportGenerationProcessor>();
services.AddReconmapAuthentication(builder.Configuration, builder.Environment);
services.AddDatabase(builder.Configuration);

services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>(name: "database")
    .AddRedis(sp => sp.GetRequiredService<IConnectionMultiplexer>(), name: "redis")
    .AddRabbitMQ(async sp =>
    {
        var settings = sp.GetRequiredService<IOptions<RabbitMQSettings>>().Value;
        var factory = new ConnectionFactory
        {
            HostName = settings.HostName,
            UserName = settings.UserName,
            Password = settings.Password
        };
        return await factory.CreateConnectionAsync();
    }, name: "rabbitmq");

services.AddSwaggerDocumentation();
services.AddCorsPolicies(builder.Configuration);
services.AddRouting(options => options.LowercaseUrls = true);
services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(365);
    options.ExcludedHosts.Add("reconmap.com");
});

services.AddControllers(options =>
    {
        options.Filters.Add<Reconmap.Api.Infrastructure.Security.OpaActionFilter>();
        options.Filters.Add<Reconmap.Api.Infrastructure.Keycloak.KeycloakUserEnrichmentFilter>();
    })
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        );
    });

services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .AddAuthenticationSchemes("ApiToken", "Bearer")
        .RequireAuthenticatedUser()
        .Build());

var app = builder.Build();
_ = app.Services.GetRequiredService<IAiProviderCatalog>();
Console.Error.WriteLine("Reconmap API bootstrap: application pipeline built; starting Kestrel.");
app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (Exception exception)
    {
        Console.Error.WriteLine(
            $"Reconmap API request failure: {context.Request.Method} {context.Request.Path} threw {exception.GetType().FullName}: {exception}");
        Log.Error(exception, "Unhandled request failure for {RequestMethod} {RequestPath}",
            context.Request.Method, context.Request.Path);
        throw;
    }
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseCors(CorsExtensions.CustomCorsPolicy);

app.MapOpenApi().AllowAnonymous();

app.MapHealthChecks("/health", new HealthCheckOptions { ResponseWriter = HealthCheckResponseWriter.WriteAsync })
    .AllowAnonymous();

app.UseSwaggerUI(options => { options.SwaggerEndpoint("/openapi/v1.json", "v1"); });

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ReadOnlyScopeMiddleware>();
app.UseMiddleware<DbUserResolverMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseCustomWebSockets();

app.MapControllers();

app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.Error.WriteLine("Reconmap API lifecycle: startup completed; Kestrel is accepting requests.");
    Log.Information("API startup completed; Kestrel is accepting requests.");
});
app.Lifetime.ApplicationStopping.Register(() =>
{
    const string message = "API shutdown was requested while running or starting. Check Docker events, host logs, and earlier API log entries for the initiating failure.";
    Console.Error.WriteLine($"Reconmap API lifecycle: {message}");
    Log.Warning(message);
});
app.Lifetime.ApplicationStopped.Register(() =>
{
    Console.Error.WriteLine("Reconmap API lifecycle: host has stopped.");
    Log.Warning("API host has stopped.");
});

AppDomain.CurrentDomain.UnhandledException += (_, eventArgs) =>
    Log.Fatal(eventArgs.ExceptionObject as Exception,
        "Unhandled CLR exception. IsTerminating={IsTerminating}", eventArgs.IsTerminating);

try
{
    app.Run();
}
catch (OperationCanceledException exception) when (app.Lifetime.ApplicationStopping.IsCancellationRequested)
{
    Console.Error.WriteLine("Reconmap API fatal: Kestrel startup was cancelled because the host shutdown token was signalled.");
    Log.Fatal(exception,
        "API startup was cancelled because the host shutdown token was signalled. This is not a listener-address error; inspect preceding startup diagnostics and Docker/host events for the initiating failure.");
    throw;
}
catch (Exception exception)
{
    Console.Error.WriteLine($"Reconmap API fatal: startup failed with {exception.GetType().FullName}: {exception.Message}");
    Log.Fatal(exception, "API terminated during startup.");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

using System.Text.Json;
using System.Text.Json.Serialization;
using api_v2.Application.Services;
using api_v2.Common;
using api_v2.Extensions;
using api_v2.Infrastructure.Authentication;
using api_v2.Infrastructure.Http;
using api_v2.Infrastructure.Persistence;
using api_v2.Infrastructure.Redis;
using api_v2.Infrastructure.Messaging;
using api_v2.Infrastructure.WebSockets;
using Amazon.S3;
using api_v2.Application.CommandProcessors;
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

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(serverOptions => { serverOptions.AddServerHeader = false; });
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .CreateLogger();
builder.Host.UseSerilog();

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

var processorType = typeof(IProcessor);
var processorTypes = typeof(Program).Assembly.GetTypes()
    .Where(t => processorType.IsAssignableFrom(t) && !t.IsAbstract && !t.IsInterface);
foreach (var type in processorTypes)
{
    services.AddScoped(type);
}

services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

services.AddTransient<IClaimsTransformation, RoleClaimsTransformation>();
services.AddSingleton<WebSocketConnectionManager>();
services.AddScoped<SystemUsageService>();
services.AddScoped<IAuditService, AuditService>();
services.AddScoped<ISecretsService, SecretsService>();
services.AddScoped<IMailSettingsService, MailSettingsService>();
services.AddScoped<IAiSettingsService, AiSettingsService>();
services.AddDataProtection()
    .SetApplicationName("Reconmap");

services.AddScoped<IAiService, AiService>();

services.AddRedisServices(builder.Configuration);
services.AddRabbitMQServices(builder.Configuration);
services.AddHostedService<CommandResultProcessor>();
services.AddHostedService<WebhookProcessor>();
services.AddHostedService<NotificationQueueListener>();
services.AddHostedService<JiraProcessor>();
services.AddHostedService<AzureDevopsProcessor>();
services.AddHostedService<ReportEmailProcessor>();
services.AddReconmapAuthentication(builder.Configuration);
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

services.AddControllers()
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
        .RequireRole("administrator")
        .Build())
    .AddPolicy("AdminOnly", policy =>
        policy.RequireRole("administrator"))
    .AddPolicy("AdminOrUser", policy =>
        policy.RequireRole("administrator", "user"));

var app = builder.Build();
await app.Services.EnsureAuxiliaryTablesAsync();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseCors(CorsExtensions.CustomCorsPolicy);

app.MapOpenApi().AllowAnonymous();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description
            })
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}).AllowAnonymous();

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

app.Run();

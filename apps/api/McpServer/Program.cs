using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using api_v2.Infrastructure.Persistence;
using ModelContextProtocol.AspNetCore;
using System.IO;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory
});

// The CreateBuilder above automatically loads appsettings.json and appsettings.Environment.json
// from the ContentRootPath (which is now guaranteed to be the bin output folder where the files were copied).

// Add the database
builder.Services.AddDatabase(builder.Configuration);

// Add the MCP services with HTTP transport
builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithTools<McpServer.Tools.ReconmapTools>()
    .WithResources<McpServer.Resources.ReconmapResources>();

// Allow CORS so the inspector can connect
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

// Map the MCP endpoint (this defaults to /mcp, which the inspector connects to via SSE)
app.MapMcp();

await app.RunAsync();

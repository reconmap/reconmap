using System.Net.Mime;
using System.Text.Json;
using api_v2.Domain.AuditActions;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[ApiController]
[Route("api/system/data")]
public class SystemDataController(AppDbContext db) : AppController(db)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DictionaryKeyPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly AppDbContext _db = db;

    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> GetData(
        [FromQuery] string entities,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(entities))
            return BadRequest("The 'entities' query parameter is required.");

        var requestedEntities = entities
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(e => e.ToLowerInvariant())
            .Distinct()
            .ToArray();

        var loaders = BuildLoaders();
        var response = new Dictionary<string, object>(requestedEntities.Length);
        foreach (var entity in requestedEntities)
        {
            if (!loaders.TryGetValue(entity, out var loader))
                return BadRequest($"Unknown entity: {entity}");

            response[entity] = await loader(cancellationToken);
        }

        var packageName = requestedEntities.Length == 1 ? requestedEntities[0] : "data";
        var fileName = $"reconmap-{packageName}-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json";

        var json = JsonSerializer.Serialize(response, JsonOptions);

        Response.Headers.AccessControlExposeHeaders = "Content-Disposition";
        Response.Headers.ContentDisposition = new ContentDisposition
        {
            FileName = fileName
        }.ToString();

        AuditAction(DataAuditActions.Exported, "System Data", new { packageName });

        return Content(json, "application/json; charset=UTF-8");
    }

    private IReadOnlyDictionary<string, Func<CancellationToken, Task<object>>> BuildLoaders()
    {
        return new Dictionary<string, Func<CancellationToken, Task<object>>>
        {
            ["audit_log"] = async ct => await _db.AuditEntries.AsNoTracking().ToListAsync(ct),
            ["commands"] = async ct => await _db.Commands.AsNoTracking().ToListAsync(ct),
            ["documents"] = async ct => await _db.Documents.AsNoTracking().ToListAsync(ct),
            ["projects"] = async ct => await _db.Projects.AsNoTracking().Where(p => !p.IsTemplate).ToListAsync(ct),
            ["project_templates"] = async ct =>
                await _db.Projects.AsNoTracking().Where(p => p.IsTemplate).ToListAsync(ct),
            ["tasks"] = async ct => await _db.Tasks.AsNoTracking().ToListAsync(ct),
            ["targets"] = async ct => await _db.Assets.AsNoTracking().ToListAsync(ct),
            ["organisations"] = async ct => await _db.Organisations.AsNoTracking().ToListAsync(ct),
            ["users"] = async ct => await _db.Users.AsNoTracking().ToListAsync(ct),
            ["vulnerabilities"] = async ct =>
                await _db.Vulnerabilities.AsNoTracking().Where(v => !v.IsTemplate).ToListAsync(ct),
            ["vulnerability_categories"] = async ct => await _db.VulnerabilityCategories.AsNoTracking().ToListAsync(ct),
            ["vulnerability_templates"] = async ct =>
                await _db.Vulnerabilities.AsNoTracking().Where(v => v.IsTemplate).ToListAsync(ct)
        };
    }
}

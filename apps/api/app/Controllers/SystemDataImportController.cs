using System.Text.Json;
using api_v2.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Controllers;

[ApiController]
[Route("api/system/data")]
public class SystemDataImportController(AppDbContext db) : AppController(db)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly AppDbContext _db = db;

    [HttpPost]
    [RequestSizeLimit(100_000_000)]
    public async Task<IActionResult> ImportData(
        IFormFile? importFile,
        CancellationToken cancellationToken)
    {
        if (importFile is null || importFile.Length == 0)
            return BadRequest("A non-empty JSON file is required.");

        if (!importFile.ContentType.Contains("json", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only JSON files are supported.");

        Dictionary<string, JsonElement> payload;

        await using (var stream = importFile.OpenReadStream())
        {
            payload = await JsonSerializer.DeserializeAsync<Dictionary<string, JsonElement>>(
                stream,
                JsonOptions,
                cancellationToken) ?? new Dictionary<string, JsonElement>();
        }

        if (payload.Count == 0)
            return BadRequest("The uploaded file does not contain any entities.");

        var response = new ImportResponse();

        foreach (var (entityName, element) in payload)
            try
            {
                var result = await ImportEntity(entityName.ToLowerInvariant(), element, cancellationToken);
                response.Results.Add(result);
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                response.Errors.Add(ex.Message);
            }

        return Ok(response);
    }

    private async Task<ImportEntityResult> ImportEntity(
        string entityName,
        JsonElement element,
        CancellationToken cancellationToken)
    {
        if (element.ValueKind != JsonValueKind.Array)
            throw new InvalidOperationException($"Entity '{entityName}' must be a JSON array.");

        var result = entityName switch
        {
            "audit_log" => await ImportAsync(element, _db.AuditEntries, cancellationToken),
            "commands" => await ImportAsync(element, _db.Commands, cancellationToken),
            "documents" => await ImportAsync(element, _db.Documents, cancellationToken),
            "projects" or "project_templates" => await ImportAsync(element, _db.Projects, cancellationToken),
            "tasks" => await ImportAsync(element, _db.Tasks, cancellationToken),
            "targets" => await ImportAsync(element, _db.Assets, cancellationToken),
            "organisations" => await ImportAsync(element, _db.Organisations, cancellationToken),
            "users" => await ImportAsync(element, _db.Users, cancellationToken),
            "vulnerabilities" or "vulnerability_templates" => await ImportAsync(element, _db.Vulnerabilities,
                cancellationToken),
            "vulnerability_categories" => await ImportAsync(element, _db.VulnerabilityCategories, cancellationToken),
            _ => throw new InvalidOperationException($"Unknown entity: {entityName}")
        };
        result.Name = entityName;
        return result;
    }

    private static async Task<ImportEntityResult> ImportAsync<TEntity>(
        JsonElement element,
        DbSet<TEntity> dbSet,
        CancellationToken cancellationToken)
        where TEntity : class
    {
        var result = new ImportEntityResult();

        var entities = JsonSerializer.Deserialize<List<TEntity>>(
            element.GetRawText(),
            JsonOptions);

        if (entities is null || entities.Count == 0)
            return result;

        try
        {
            await dbSet.AddRangeAsync(entities, cancellationToken);
            result.Count = entities.Count;
        }
        catch (Exception ex)
        {
// Capture only the first meaningful error
            result.Errors.Add(GetRootExceptionMessage(ex));
        }

        return result;
    }

    private static string GetRootExceptionMessage(Exception ex)
    {
        while (ex.InnerException is not null)
            ex = ex.InnerException;

        return ex.Message;
    }

    private sealed class ImportResponse
    {
        public List<string> Errors { get; } = new();
        public List<ImportEntityResult> Results { get; } = new();
    }

    private sealed class ImportEntityResult
    {
        public string Name { get; set; }
        public int Count { get; set; }
        public List<string> Errors { get; } = new();
    }
}

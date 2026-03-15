using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Domain.Entities;

namespace api_v2.Application.CommandProcessors;

// docker run --rm -ti -v $PWD:/data --workdir /data ghcr.io/testssl/testssl.sh --jsonfile testssl-output.json https://localhost
public class TestsslProcessor : IProcessor
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Testssl";
    public string Description => "Testssl integration";
    public string ExternalUrl => "https://github.com/testssl/testssl.sh";
    public bool IsConfigured => true;

    public ProcessorResult Process(CommandProcessorJob job)
    {
        var result = new ProcessorResult();

        var path = _attachmentFilePath.GenerateFilePath(job.FilePath);
        if (!File.Exists(path)) return result;

        var fileContent = File.ReadAllText(path);

        JsonElement json;
        try
        {
            json = JsonSerializer.Deserialize<JsonElement>(fileContent);
        }
        catch (JsonException)
        {
            throw new Exception("Invalid JSON: " + path);
        }

        foreach (var rawVulnerability in json.EnumerateArray())
        {
            var severity = rawVulnerability.GetProperty("severity")
                .GetString()?
                .ToLowerInvariant();

            if (severity is "ok" or "info")
                continue;

            var vulnerability = new Vulnerability
            {
                Summary = $"{rawVulnerability.GetProperty("id").GetString()}: " +
                          $"{rawVulnerability.GetProperty("finding").GetString()}",
                Risk = severity
            };
            var tags = new List<string>();

            if (rawVulnerability.TryGetProperty("cve", out var cve)) tags.Add(cve.GetString());

            if (rawVulnerability.TryGetProperty("cwe", out var cwe)) tags.Add(cwe.GetString());

            var ip = rawVulnerability.GetProperty("ip").GetString();
            var hostname = ip?.Split('/')[0];

            vulnerability.Asset = new Asset
            {
                Kind = "hostname",
                Name = hostname,
                ProjectId = job.ProjectId
            };
            vulnerability.Tags = JsonSerializer.Serialize(tags);
            vulnerability.ProjectId = job.ProjectId;

            result.AddFinding(vulnerability);
        }

        return result;
    }
}

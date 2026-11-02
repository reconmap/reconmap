using System.IO;
using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Application.CommandParsers;

// docker run --rm -ti -v $PWD:/data --workdir /data ghcr.io/testssl/testssl.sh --jsonfile testssl-output.json https://localhost
public class TestsslParser(IAttachmentStorage attachmentStorage) : ICommandParser
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Testssl";
    public string Description => "Testssl integration";
    public string ExternalUrl => "https://github.com/testssl/testssl.sh";
    public bool IsConfigured => true;

    public CommandParserResult Parse(CommandProcessorJob job)
    {
        var result = new CommandParserResult();

        string fileContent;
        using (var stream = attachmentStorage.GetFileStreamAsync(job.FilePath).GetAwaiter().GetResult())
        {
            using (var reader = new StreamReader(stream))
            {
                fileContent = reader.ReadToEnd();
            }
        }

        JsonElement json;
        try
        {
            json = JsonSerializer.Deserialize<JsonElement>(fileContent);
        }
        catch (JsonException e)
        {
            throw new Exception("Invalid JSON: " + e.GetBaseException().Message);
        }

        foreach (var rawFinding in json.EnumerateArray())
        {
            var severity = rawFinding.GetProperty("severity")
                .GetString()?
                .ToLowerInvariant();

            if (severity is "ok" or "info")
                continue;

            var finding = new Finding
            {
                Summary = $"{rawFinding.GetProperty("id").GetString()}: " +
                          $"{rawFinding.GetProperty("finding").GetString()}",
                Risk = severity
            };
            var tags = new List<string>();

            if (rawFinding.TryGetProperty("cve", out var cve)) tags.Add(cve.GetString());

            if (rawFinding.TryGetProperty("cwe", out var cwe)) tags.Add(cwe.GetString());

            var ip = rawFinding.GetProperty("ip").GetString();
            var hostname = ip?.Split('/')[0];

            finding.Asset = new Asset
            {
                Type = "hostname",
                Name = hostname,
                ProjectId = job.ProjectId
            };
            finding.Tags = JsonSerializer.Serialize(tags);
            finding.ProjectId = job.ProjectId;

            result.AddFinding(finding);
        }

        return result;
    }
}

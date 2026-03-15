using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Domain.Entities;

namespace api_v2.Application.CommandProcessors;

public class ShcheckProcessor : IProcessor
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Shcheck";
    public string Description => "Shcheck integration";
    public string ExternalUrl => "https://github.com/santoru/shcheck";
    public bool IsConfigured => true;

    public ProcessorResult Process(CommandProcessorJob job)
    {
        var result = new ProcessorResult();

        var path = _attachmentFilePath.GenerateFilePath(job.FilePath);
        if (!File.Exists(path)) return result;

        var json = File.ReadAllText(path);

        // Deserialise into a nested dictionary:
        // { url -> { "present" -> {...}, "missing" -> [...] } }
        var output = JsonSerializer.Deserialize<
            Dictionary<string, Dictionary<string, JsonElement>>
        >(json);

        if (output == null)
            return result;

        foreach (var entry in output.Values)
            if (entry.TryGetValue("missing", out var missingElement) &&
                missingElement.ValueKind == JsonValueKind.Array)
                foreach (var missingHeader in missingElement.EnumerateArray())
                {
                    var headerName = missingHeader.GetString();
                    if (string.IsNullOrEmpty(headerName))
                        continue;

                    var vulnerability = new Vulnerability
                    {
                        Summary = $"Missing security header: {headerName}",
                        Description = $"Missing security header: {headerName}",
                        Tags = "[\"headers\"]" // new List<string> { "headers" }
                    };

                    result.AddFinding(vulnerability);
                }

        return result;
    }
}

using System.IO;
using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Application.CommandParsers;

public class ShcheckParser(IAttachmentStorage attachmentStorage) : ICommandParser
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Shcheck";
    public string Description => "Shcheck integration";
    public string ExternalUrl => "https://github.com/santoru/shcheck";
    public bool IsConfigured => true;

    public CommandParserResult Parse(CommandProcessorJob job)
    {
        var result = new CommandParserResult();

        string json;
        using (var stream = attachmentStorage.GetFileStreamAsync(job.FilePath).GetAwaiter().GetResult())
        {
            using (var reader = new StreamReader(stream))
            {
                json = reader.ReadToEnd();
            }
        }

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

                    var finding = new Finding
                    {
                        Summary = $"Missing security header: {headerName}",
                        Description = $"Missing security header: {headerName}",
                        Tags = "[\"headers\"]" // new List<string> { "headers" }
                    };

                    result.AddFinding(finding);
                }

        return result;
    }
}

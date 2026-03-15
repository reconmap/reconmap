using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Domain.Entities;

namespace api_v2.Application.CommandProcessors;

// docker run --rm -ti -v $PWD:/data --workdir /data ghcr.io/testssl/testssl.sh --jsonfile testssl-output.json https://localhost
public class SubfinderProcessor : IProcessor
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Subfinder";
    public string Description => "Subfinder integration";
    public string ExternalUrl => "https://github.com/projectdiscovery/subfinder";
    public bool IsConfigured => true;

    public ProcessorResult Process(CommandProcessorJob job)
    {
        var result = new ProcessorResult();

        var path = _attachmentFilePath.GenerateFilePath(job.FilePath);
        if (!File.Exists(path)) return result;

        var lines = File.ReadAllLines(path);
        foreach (var line in lines)
        {
            /*
             {
                {"host":"mail.rmap.org","source":"crtsh"}
                {"host":"www.rmap.org","source":"crtsh"}
             }
            */

            if (string.IsNullOrWhiteSpace(line))
                continue;

            using var json = JsonDocument.Parse(line);
            var host = json.RootElement.GetProperty("host").GetString();

            var hostAsset = new Asset
            {
                Kind = "hostname",
                Name = host
            };

            result.AddAsset(hostAsset);
        }

        return result;
    }
}

using System.IO;
using System.Text.Json;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Application.CommandParsers;

// docker run --rm -ti -v $PWD:/data --workdir /data ghcr.io/testssl/testssl.sh --jsonfile testssl-output.json https://localhost
public class SubfinderParser(IAttachmentStorage attachmentStorage) : ICommandParser
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Subfinder";
    public string Description => "Subfinder integration";
    public string ExternalUrl => "https://github.com/projectdiscovery/subfinder";
    public bool IsConfigured => true;

    public CommandParserResult Parse(CommandProcessorJob job)
    {
        var result = new CommandParserResult();

        using (var stream = attachmentStorage.GetFileStreamAsync(job.FilePath).GetAwaiter().GetResult())
        {
            using (var reader = new StreamReader(stream))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    if (string.IsNullOrWhiteSpace(line))
                        continue;

                    using var json = JsonDocument.Parse(line);
                    var host = json.RootElement.GetProperty("host").GetString();

                    var hostAsset = new Asset
                    {
                        Type = "hostname",
                        Name = host
                    };

                    result.AddAsset(hostAsset);
                }
            }
        }

        return result;
    }
}

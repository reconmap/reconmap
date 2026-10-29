using System.Text.Json;
using System.Xml.Linq;
using Reconmap.Api.Application.Services;
using Reconmap.Api.Controllers;
using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Application.CommandParsers;

public class NmapParser(IAttachmentStorage attachmentStorage) : ICommandParser
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Nmap";
    public string Description => "Nmap integration";
    public string ExternalUrl => "https://nmap.org/";
    public bool IsConfigured => true;

    public CommandParserResult Parse(CommandProcessorJob job)
    {
        var result = new CommandParserResult();

        using var stream = attachmentStorage.GetFileStreamAsync(job.FilePath).GetAwaiter().GetResult();
        XDocument xml;
        try
        {
            xml = XDocument.Load(stream);
        }
        catch
        {
            return result;
        }

        foreach (var host in xml.Descendants("host"))
        {
            var addressElement = host.Element("address");
            if (addressElement == null)
                continue;

            var hostAddress = (string)addressElement.Attribute("addr");
            if (string.IsNullOrEmpty(hostAddress))
                continue;

            var hostAsset = new Asset();
            hostAsset.Type = "hostname";
            hostAsset.Name = hostAddress;

            var addrType = (string)addressElement.Attribute("addrtype");
            if (!string.IsNullOrEmpty(addrType))
                hostAsset.Attributes = JsonSerializer.Serialize(new { addrType });

            var portsElement = host.Element("ports");
            if (portsElement != null)
                foreach (var port in portsElement.Elements("port"))
                {
                    var state = (string)port.Element("state")?.Attribute("state");
                    if (state == "open")
                        if (int.TryParse((string)port.Attribute("portid"), out var portNumber))
                        {
                            var protocol = (string)port.Attribute("protocol");
                            var serviceElement = port.Element("service");

                            var portAsset = new Asset();
                            portAsset.Type = "port";
                            portAsset.Name = string.IsNullOrEmpty(protocol)
                                ? portNumber.ToString()
                                : $"{portNumber}/{protocol}";
                            portAsset.Attributes = JsonSerializer.Serialize(new
                            {
                                port = portNumber,
                                protocol,
                                service = (string)serviceElement?.Attribute("name"),
                                product = (string)serviceElement?.Attribute("product"),
                                version = (string)serviceElement?.Attribute("version")
                            }, new JsonSerializerOptions { DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });

                            hostAsset.AddChild(portAsset);
                        }
                }

            result.AddAsset(hostAsset);
        }

        return result;
    }
}

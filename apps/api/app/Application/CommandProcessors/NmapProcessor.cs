using System.Xml.Linq;
using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Domain.Entities;

namespace api_v2.Application.CommandProcessors;

public class NmapProcessor : IProcessor
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public string Name => "Nmap";
    public string Description => "Nmap integration";
    public string ExternalUrl => "https://nmap.org/";
    public bool IsConfigured => true;

    public ProcessorResult Process(CommandProcessorJob job)
    {
        var result = new ProcessorResult();

        var path = _attachmentFilePath.GenerateFilePath(job.FilePath);
        if (!File.Exists(path)) return result;

        XDocument xml;
        try
        {
            xml = XDocument.Load(path);
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
            hostAsset.Kind = "hostname";
            hostAsset.Name = hostAddress;

            var addrType = (string)addressElement.Attribute("addrtype");
            //if (!string.IsNullOrEmpty(addrType)) hostAsset.AddTag(addrType);

            var portsElement = host.Element("ports");
            if (portsElement != null)
                foreach (var port in portsElement.Elements("port"))
                {
                    var state = (string)port.Element("state")?.Attribute("state");
                    if (state == "open")
                        if (int.TryParse((string)port.Attribute("portid"), out var portNumber))
                        {
                            var portAsset = new Asset();
                            portAsset.Kind = "port";
                            portAsset.Name = portNumber.ToString();

                            //hostAsset.AddChild(portAsset);
                        }
                }

            result.AddAsset(hostAsset);
        }

        return result;
    }
}

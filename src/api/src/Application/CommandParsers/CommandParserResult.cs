using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Application.CommandParsers;

public class CommandParserResult
{
    public List<Asset> assets = new();
    public List<Vulnerability> vulnerabilities = new();

    public void AddAsset(Asset asset)
    {
        assets.Add(asset);
    }

    public void AddVulnerability(Vulnerability vulnerability)
    {
        vulnerabilities.Add(vulnerability);
    }
}

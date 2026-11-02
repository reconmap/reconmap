using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Application.CommandParsers;

public class CommandParserResult
{
    public List<Asset> assets = new();
    public List<Finding> findings = new();

    public void AddAsset(Asset asset)
    {
        assets.Add(asset);
    }

    public void AddFinding(Finding finding)
    {
        findings.Add(finding);
    }
}

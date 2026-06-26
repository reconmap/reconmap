using api_v2.Domain.Entities;

namespace api_v2.Application.CommandProcessors;

public class ProcessorResult
{
    public List<Asset> assets = new();
    public List<Vulnerability> findings = new();

    public void AddAsset(Asset asset)
    {
        assets.Add(asset);
    }

    public void AddFinding(Vulnerability vulnerability)
    {
        findings.Add(vulnerability);
    }
}

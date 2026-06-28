using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class SyftCommand : ICommand
{
    public string Id => "syft";
    public string Name => "Syft";
    public string Description => "CLI tool for generating a Software Bill of Materials (SBOM) from container images and filesystems.";
    public string? MoreInfoUrl => "https://github.com/anchore/syft";
    public string[] Tags => ["sbom", "supply-chain", "container", "sca"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "syft-dir-cyclonedx",
            Description = "Generate CycloneDX SBOM from current directory.",
            ExecutablePath = "syft",
            Arguments = "dir:. --output cyclonedx-json=results.json",
            OutputCapturingMode = "file",
            OutputFilename = "results.json",
            OutputParser = "cyclonedx"
        }
    };
}

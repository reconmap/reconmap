using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class TrivyCommand : ICommand
{
    public string Id => "trivy";
    public string Name => "Trivy";
    public string Description => "Vulnerability scanner for containers, git repositories, and filesystems.";
    public string? MoreInfoUrl => "https://github.com/aquasecurity/trivy";
    public string[] Tags => ["sast", "container", "vulnerability", "sarif"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "trivy-fs-sarif",
            Description = "Scan directory and output in SARIF format.",
            ExecutablePath = "trivy",
            Arguments = "fs -f sarif -o results.sarif .",
            OutputCapturingMode = "file",
            OutputFilename = "results.sarif",
            OutputParser = "sarif"
        }
    };
}

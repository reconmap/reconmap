using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class SnykCommand : ICommand
{
    public string Id => "snyk";
    public string Name => "Snyk";
    public string Description => "Developer security platform for code, dependencies, containers, and IaC.";
    public string? MoreInfoUrl => "https://snyk.io/";
    public string[] Tags => ["sast", "dependencies", "container", "sarif"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "snyk-test-sarif",
            Description = "Run Snyk test on project dependencies and output in SARIF format.",
            ExecutablePath = "snyk",
            Arguments = "test --sarif-file-output=results.sarif",
            OutputCapturingMode = "file",
            OutputFilename = "results.sarif",
            OutputParser = "sarif"
        }
    };
}

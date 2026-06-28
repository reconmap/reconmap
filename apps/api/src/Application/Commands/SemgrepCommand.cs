using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class SemgrepCommand : ICommand
{
    public string Id => "semgrep";
    public string Name => "Semgrep";
    public string Description => "Lightweight static analysis tool for finding bugs and enforcing code standards.";
    public string? MoreInfoUrl => "https://semgrep.dev/";
    public string[] Tags => ["sast", "static-analysis", "sarif"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "semgrep-sarif",
            Description = "Run Semgrep rules on codebase and output in SARIF format.",
            ExecutablePath = "semgrep",
            Arguments = "--config=auto --sarif -o results.sarif",
            OutputCapturingMode = "file",
            OutputFilename = "results.sarif",
            OutputParser = "sarif"
        }
    };
}

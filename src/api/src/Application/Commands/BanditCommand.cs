using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class BanditCommand : ICommand
{
    public string Id => "bandit";
    public string Name => "Bandit";
    public string Description => "Bandit is a tool designed to find common security issues in Python code.";
    public string? MoreInfoUrl => "https://bandit.readthedocs.io/";
    public string[] Tags => ["sast", "python", "sarif"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "bandit-sarif",
            Description = "Run Bandit scan recursively on Python codebase and output in SARIF format.",
            ExecutablePath = "bandit",
            Arguments = "-r . -f sarif -o results.sarif",
            OutputCapturingMode = "file",
            OutputFilename = "results.sarif",
            OutputParser = "sarif"
        }
    };
}

using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class SarifCommand : ICommand
{
    public string Id => "sarif";
    public string Name => "SARIF";
    public string Description => "Runs static analysis security testing (SAST) tools and outputs SARIF format results.";
    public string? MoreInfoUrl => "https://sarifweb.azurewebsites.net/";
    public string[] Tags => ["sast", "sarif", "scanner"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "sarif-gosec",
            Description = "Go Security Checker (gosec) scan.",
            ExecutablePath = "gosec",
            Arguments = "-fmt sarif -out results.sarif ./...",
            OutputCapturingMode = "file",
            OutputFilename = "results.sarif",
            OutputParser = "sarif"
        }
    };
}

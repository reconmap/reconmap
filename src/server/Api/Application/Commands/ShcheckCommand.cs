using System.Collections.Generic;

namespace Reconmap.Api.Application.Commands;

public class ShcheckCommand : ICommand
{
    public string Id => "shcheck";
    public string Name => "Shcheck";
    public string Description => "Tool to check security headers on a target webserver.";
    public string? MoreInfoUrl => "https://github.com/santatic/shcheck";
    public string[] Tags => ["headers", "webapp", "scanner"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "shcheck-headers",
            Description = "Scan target web server for security headers.",
            ExecutablePath = "shcheck.py",
            Arguments = "-j {{{URL|||https://localhost}}}",
            OutputCapturingMode = "stdout",
            OutputParser = "shcheck"
        }
    };
}

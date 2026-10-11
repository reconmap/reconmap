using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class SubfinderCommand : ICommand
{
    public string Id => "subfinder";
    public string Name => "Subfinder";
    public string Description => "Subdomain discovery tool that discovers valid subdomains for websites by using passive online sources.";
    public string? MoreInfoUrl => "https://github.com/projectdiscovery/subfinder";
    public string[] Tags => ["subdomain", "dns", "passive"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "subfinder-subdomains",
            Description = "Find subdomains for a domain.",
            ExecutablePath = "subfinder",
            Arguments = "-d {{{Domain|||test.com}}} -o reconmap-subfinder-output.jsonl -oJ -nW",
            OutputCapturingMode = "file",
            OutputFilename = "reconmap-subfinder-output.jsonl",
            OutputParser = "subfinder"
        }
    };
}

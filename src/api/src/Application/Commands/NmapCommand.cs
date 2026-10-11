using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class NmapCommand : ICommand
{
    public string Id => "nmap";
    public string Name => "Nmap";
    public string Description => "Network exploration tool and security / port scanner";
    public string? MoreInfoUrl => "https://nmap.org/";
    public string[] Tags => ["scanner", "ports", "network"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "nmap-tcp-syn",
            Description = "Scan all reserved TCP ports on the machine.",
            ExecutablePath = "nmap",
            Arguments = "-oX - {{{Host|||localhost}}}",
            OutputCapturingMode = "stdout",
            OutputParser = "nmap"
        }
    };
}

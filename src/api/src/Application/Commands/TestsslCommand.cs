using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class TestsslCommand : ICommand
{
    public string Id => "testssl";
    public string Name => "Testssl";
    public string Description => "Free command line tool which checks a server's service on any port for the support of TLS/SSL ciphers, protocols as well as cryptographic flaws.";
    public string? MoreInfoUrl => "https://github.com/testssl/testssl.sh";
    public string[] Tags => ["ssl", "tls", "scanner"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "testssl-scan",
            Description = "SSL/TLS cryptographic flaw scanning.",
            ExecutablePath = "testssl",
            Arguments = "--jsonfile testssl-output.json {{{Target}}}",
            OutputCapturingMode = "file",
            OutputFilename = "testssl-output.json",
            OutputParser = "testssl"
        }
    };
}

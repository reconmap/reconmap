using System.Collections.Generic;

namespace api_v2.Application.Commands;

public class GenericLlmCommand : ICommand
{
    public string Id => "generic-llm";
    public string Name => "Generic LLM Parser";
    public string Description => "Runs a custom command output and parses the results using a Large Language Model.";
    public string? MoreInfoUrl => null;
    public string[] Tags => ["llm", "parser", "ai"];

    public IEnumerable<CommandUsageDefinition> Usages => new[]
    {
        new CommandUsageDefinition
        {
            Id = "generic-llm-parse",
            Description = "Generic LLM Parser.",
            ExecutablePath = "echo",
            Arguments = "{{{Input}}}",
            OutputCapturingMode = "stdout",
            OutputParser = "genericLlm"
        }
    };
}

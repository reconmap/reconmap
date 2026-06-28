using api_v2.Controllers;

namespace api_v2.Application.CommandParsers;

public interface ICommandParser
{
    string Name { get; }
    string Description { get; }
    string ExternalUrl { get; }
    bool IsConfigured { get; }

    public CommandParserResult Parse(CommandProcessorJob job);
}

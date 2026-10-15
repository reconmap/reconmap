using Reconmap.Api.Controllers;

namespace Reconmap.Api.Application.CommandParsers;

public interface ICommandParser
{
    string Name { get; }
    string Description { get; }
    string ExternalUrl { get; }
    bool IsConfigured { get; }

    public CommandParserResult Parse(CommandProcessorJob job);
}

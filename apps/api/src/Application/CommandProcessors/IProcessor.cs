using api_v2.Controllers;

namespace api_v2.Application.CommandProcessors;

public interface IProcessor
{
    string Name { get; }
    string Description { get; }
    string ExternalUrl { get; }
    bool IsConfigured { get; }

    public ProcessorResult Process(CommandProcessorJob job);
}

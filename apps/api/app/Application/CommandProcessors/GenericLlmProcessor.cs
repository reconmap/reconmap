using api_v2.Application.Services;
using api_v2.Common;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;

namespace api_v2.Application.CommandProcessors;

public class GenericLlmProcessor(IAiService aiService, IAttachmentStorage attachmentStorage, AppDbContext dbContext) : IProcessor
{
    public string Name => "Generic LLM";
    public string Description => "Parses any tool output using an LLM";
    public string ExternalUrl => string.Empty;
    public bool IsConfigured => true;

    public ProcessorResult Process(CommandProcessorJob job)
    {
        var result = new ProcessorResult();

        var commandUsage = dbContext.CommandUsages.Find(job.CommandUsageId);
        var toolName = commandUsage?.Description ?? "Unknown Tool";

        using var stream = attachmentStorage.GetFileStreamAsync(job.FilePath).GetAwaiter().GetResult();
        using var reader = new StreamReader(stream);
        var output = reader.ReadToEnd();

        if (output.Length > 10000)
        {
            output = output[..10000] + "... [truncated]";
        }

        var aiResult = aiService.ParseCommandOutputAsync(toolName, output).GetAwaiter().GetResult();

        foreach (var aiAsset in aiResult.Assets)
        {
            result.AddAsset(new Asset
            {
                Name = aiAsset.Name,
                Kind = aiAsset.Kind
            });
        }

        foreach (var aiFinding in aiResult.Findings)
        {
            result.AddFinding(new Vulnerability
            {
                Summary = aiFinding.Summary,
                Description = aiFinding.Description,
                Risk = aiFinding.Risk,
                Remediation = aiFinding.Remediation,
                ProofOfConcept = aiFinding.ProofOfConcept
            });
        }

        return result;
    }
}

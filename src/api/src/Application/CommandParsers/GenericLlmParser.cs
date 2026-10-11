using api_v2.Application.Commands;
using api_v2.Application.Services;
using api_v2.Common;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;

namespace api_v2.Application.CommandParsers;

public class GenericLlmParser(IAiService aiService, IAttachmentStorage attachmentStorage, AppDbContext dbContext) : ICommandParser
{
    public string Name => "Generic LLM";
    public string Description => "Parses any tool output using an LLM";
    public string ExternalUrl => string.Empty;
    public bool IsConfigured => true;

    public CommandParserResult Parse(CommandProcessorJob job)
    {
        var result = new CommandParserResult();

        var commandUsage = CommandDiscovery.FindUsageById(job.CommandUsageId);
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
                Type = aiAsset.Type
            });
        }

        foreach (var aiVulnerability in aiResult.Vulnerabilities)
        {
            result.AddVulnerability(new Vulnerability
            {
                Summary = aiVulnerability.Summary,
                Description = aiVulnerability.Description,
                Risk = aiVulnerability.Risk,
                Remediation = aiVulnerability.Remediation,
                ProofOfConcept = aiVulnerability.ProofOfConcept
            });
        }

        return result;
    }
}

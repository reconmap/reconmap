using System.IO;
using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Domain.Entities;
using Microsoft.CodeAnalysis.Sarif;
using Newtonsoft.Json;

namespace api_v2.Application.CommandParsers;

public class SarifParser(IAttachmentStorage attachmentStorage) : ICommandParser
{
    public string Name => "Sarif";
    public string Description => "SARIF results parser";
    public string ExternalUrl => "https://sarifweb.azurewebsites.net/";
    public bool IsConfigured => true;

    public CommandParserResult Parse(CommandProcessorJob job)
    {
        var result = new CommandParserResult();

        using var stream = attachmentStorage.GetFileStreamAsync(job.FilePath).GetAwaiter().GetResult();
        using var reader = new StreamReader(stream);
        using var jsonReader = new JsonTextReader(reader);
        
        var serializer = new JsonSerializer();
        SarifLog? sarifLog;
        try
        {
            sarifLog = serializer.Deserialize<SarifLog>(jsonReader);
        }
        catch
        {
            return result;
        }

        if (sarifLog?.Runs == null)
            return result;

        foreach (var run in sarifLog.Runs)
        {
            if (run.Results == null)
                continue;

            foreach (var sarifResult in run.Results)
            {
                var ruleId = sarifResult.RuleId;
                var message = sarifResult.Message?.Text ?? string.Empty;

                ReportingDescriptor? rule = null;
                if (run.Tool?.Driver?.Rules != null)
                {
                    if (sarifResult.RuleIndex >= 0 && sarifResult.RuleIndex < run.Tool.Driver.Rules.Count)
                    {
                        rule = run.Tool.Driver.Rules[sarifResult.RuleIndex];
                    }
                    else
                    {
                        rule = run.Tool.Driver.Rules.FirstOrDefault(r => r.Id == ruleId);
                    }
                }

                var summary = rule?.ShortDescription?.Text ?? message;
                if (string.IsNullOrWhiteSpace(summary))
                {
                    summary = ruleId ?? "SARIF Finding";
                }

                // Truncate summary to max length 500
                if (summary.Length > 500)
                {
                    summary = summary[..497] + "...";
                }

                var description = rule?.FullDescription?.Text ?? message;
                if (string.IsNullOrWhiteSpace(description))
                {
                    description = summary;
                }

                var externalRefs = rule?.HelpUri?.ToString();

                // Proof of concept from locations
                var locationsList = new List<string>();
                if (sarifResult.Locations != null)
                {
                    foreach (var location in sarifResult.Locations)
                    {
                        var physLoc = location.PhysicalLocation;
                        if (physLoc != null)
                        {
                            var uri = physLoc.ArtifactLocation?.Uri?.ToString();
                            var startLine = physLoc.Region?.StartLine;
                            if (!string.IsNullOrEmpty(uri))
                            {
                                if (startLine.HasValue)
                                    locationsList.Add($"{uri}:{startLine}");
                                else
                                    locationsList.Add(uri);
                            }
                        }
                    }
                }

                var proofOfConcept = locationsList.Any()
                    ? "Locations:\n" + string.Join("\n", locationsList)
                    : null;

                // Map level to Risk
                // FailureLevel enum: None, Note, Warning, Error
                var risk = "medium";
                switch (sarifResult.Level)
                {
                    case FailureLevel.Error:
                        risk = "high";
                        break;
                    case FailureLevel.Warning:
                        risk = "medium";
                        break;
                    case FailureLevel.Note:
                        risk = "low";
                        break;
                    case FailureLevel.None:
                        risk = "none";
                        break;
                }

                var vulnerability = new Vulnerability
                {
                    Summary = summary,
                    Description = description,
                    ProofOfConcept = proofOfConcept,
                    ExternalRefs = externalRefs,
                    Risk = risk,
                    Status = "open"
                };

                result.AddFinding(vulnerability);
            }
        }

        return result;
    }
}

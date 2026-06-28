using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using api_v2.Application.Services;
using api_v2.Controllers;
using api_v2.Domain.Entities;

namespace api_v2.Application.CommandParsers;

public class CycloneDxParser(IAttachmentStorage attachmentStorage) : ICommandParser
{
    public string Name => "CycloneDX";
    public string Description => "Parses CycloneDX SBOM JSON files to extract packages and vulnerabilities";
    public string ExternalUrl => "https://cyclonedx.org/";
    public bool IsConfigured => true;

    public CommandParserResult Parse(CommandProcessorJob job)
    {
        var result = new CommandParserResult();

        string fileContent;
        using (var stream = attachmentStorage.GetFileStreamAsync(job.FilePath).GetAwaiter().GetResult())
        {
            using (var reader = new StreamReader(stream))
            {
                fileContent = reader.ReadToEnd();
            }
        }

        using var jsonDoc = JsonDocument.Parse(fileContent);
        var root = jsonDoc.RootElement;

        // Build mapping of bom-ref / purl -> Asset to associate findings to correct assets
        var refToAssetMap = new Dictionary<string, Asset>(StringComparer.OrdinalIgnoreCase);
        var componentsList = new List<Asset>();

        if (root.TryGetProperty("components", out var components) && components.ValueKind == JsonValueKind.Array)
        {
            foreach (var component in components.EnumerateArray())
            {
                if (!component.TryGetProperty("name", out var nameProp))
                    continue;

                var name = nameProp.GetString();
                if (string.IsNullOrWhiteSpace(name))
                    continue;

                var version = component.TryGetProperty("version", out var verProp) ? verProp.GetString() : null;
                var purl = component.TryGetProperty("purl", out var purlProp) ? purlProp.GetString() : null;
                var bomRef = component.TryGetProperty("bom-ref", out var refProp) ? refProp.GetString() : null;

                var assetName = string.IsNullOrEmpty(version) ? name : $"{name}@{version}";
                var asset = new Asset
                {
                    Kind = "package",
                    Name = assetName,
                    ProjectId = job.ProjectId
                };

                var tagsList = new List<string> { "dependency" };
                if (!string.IsNullOrEmpty(purl))
                {
                    tagsList.Add($"purl:{purl}");
                }

                if (component.TryGetProperty("licenses", out var licenses) && licenses.ValueKind == JsonValueKind.Array)
                {
                    foreach (var licenseItem in licenses.EnumerateArray())
                    {
                        if (licenseItem.TryGetProperty("license", out var license))
                        {
                            if (license.TryGetProperty("id", out var licId))
                            {
                                tagsList.Add($"license:{licId.GetString()}");
                            }
                            else if (license.TryGetProperty("name", out var licName))
                            {
                                tagsList.Add($"license:{licName.GetString()}");
                            }
                        }
                    }
                }

                asset.Tags = JsonSerializer.Serialize(tagsList);
                componentsList.Add(asset);

                if (!string.IsNullOrEmpty(bomRef))
                {
                    refToAssetMap[bomRef] = asset;
                }
                if (!string.IsNullOrEmpty(purl))
                {
                    refToAssetMap[purl] = asset;
                }
            }
        }

        // Add all components as assets to the result
        foreach (var compAsset in componentsList)
        {
            result.AddAsset(compAsset);
        }

        // Parse vulnerabilities
        if (root.TryGetProperty("vulnerabilities", out var vulnerabilities) && vulnerabilities.ValueKind == JsonValueKind.Array)
        {
            foreach (var vul in vulnerabilities.EnumerateArray())
            {
                if (!vul.TryGetProperty("id", out var idProp))
                    continue;

                var cveId = idProp.GetString();
                if (string.IsNullOrWhiteSpace(cveId))
                    continue;

                var description = vul.TryGetProperty("description", out var descProp) ? descProp.GetString() : string.Empty;
                var recommendation = vul.TryGetProperty("recommendation", out var recProp) ? recProp.GetString() : string.Empty;

                var severity = "medium";
                if (vul.TryGetProperty("ratings", out var ratings) && ratings.ValueKind == JsonValueKind.Array)
                {
                    var firstRating = ratings.EnumerateArray().FirstOrDefault();
                    if (firstRating.ValueKind == JsonValueKind.Object && firstRating.TryGetProperty("severity", out var sevProp))
                    {
                        var sevVal = sevProp.GetString()?.ToLowerInvariant();
                        severity = sevVal switch
                        {
                            "critical" or "high" => "high",
                            "medium" => "medium",
                            "low" or "info" => "low",
                            _ => "none"
                        };
                    }
                }

                Asset? affectedAsset = null;
                if (vul.TryGetProperty("affects", out var affects) && affects.ValueKind == JsonValueKind.Array)
                {
                    foreach (var affected in affects.EnumerateArray())
                    {
                        if (affected.TryGetProperty("ref", out var refVal))
                        {
                            var refStr = refVal.GetString();
                            if (!string.IsNullOrEmpty(refStr) && refToAssetMap.TryGetValue(refStr, out var matchedAsset))
                            {
                                affectedAsset = matchedAsset;
                                break;
                            }
                        }
                    }
                }

                var summary = affectedAsset != null ? $"{cveId} in {affectedAsset.Name}" : cveId;

                var vulnerability = new Vulnerability
                {
                    Summary = summary,
                    Description = string.IsNullOrWhiteSpace(description) ? summary : description,
                    Remediation = recommendation,
                    Risk = severity,
                    Status = "open",
                    ProjectId = job.ProjectId
                };

                if (affectedAsset != null)
                {
                    vulnerability.Asset = affectedAsset;
                }

                result.AddFinding(vulnerability);
            }
        }

        return result;
    }
}

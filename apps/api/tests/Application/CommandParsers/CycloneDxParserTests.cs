using System.IO;
using System.Linq;
using System.Threading.Tasks;
using api_v2.Application.CommandParsers;
using api_v2.Application.Services;
using api_v2.Controllers;
using Xunit;

namespace tests.Application.CommandParsers;

public class CycloneDxParserTests
{
    private class FakeAttachmentStorage : IAttachmentStorage
    {
        private readonly string _content;

        public FakeAttachmentStorage(string content)
        {
            _content = content;
        }

        public Task<Stream> GetFileStreamAsync(string fileName)
        {
            var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(_content));
            return Task.FromResult<Stream>(stream);
        }

        public Task SaveFileAsync(string fileName, Stream stream) => Task.CompletedTask;
        public Task DeleteFileAsync(string fileName) => Task.CompletedTask;
        public Task<string> GetFileHashAsync(string fileName) => Task.FromResult(string.Empty);
    }

    [Fact]
    public void Parse_InvalidJson_ThrowsException()
    {
        var fakeStorage = new FakeAttachmentStorage("{ malformed json }");
        var parser = new CycloneDxParser(fakeStorage);
        var job = new CommandProcessorJob { FilePath = "sbom.json" };

        Assert.ThrowsAny<System.Text.Json.JsonException>(() => parser.Parse(job));
    }

    [Fact]
    public void Parse_ValidCycloneDx_ParsesComponentsAndVulnerabilitiesCorrectly()
    {
        var jsonContent = @"{
          ""bomFormat"": ""CycloneDX"",
          ""specVersion"": ""1.4"",
          ""components"": [
            {
              ""bom-ref"": ""pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1"",
              ""type"": ""library"",
              ""name"": ""log4j-core"",
              ""version"": ""2.14.1"",
              ""purl"": ""pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1"",
              ""licenses"": [
                {
                  ""license"": {
                    ""id"": ""Apache-2.0""
                  }
                }
              ]
            }
          ],
          ""vulnerabilities"": [
            {
              ""id"": ""CVE-2021-44228"",
              ""description"": ""Apache Log4j2 remote code execution vulnerability."",
              ""ratings"": [
                {
                  ""severity"": ""critical""
                }
              ],
              ""recommendation"": ""Upgrade to 2.15.0 or higher"",
              ""affects"": [
                {
                  ""ref"": ""pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1""
                }
              ]
            }
          ]
        }";

        var fakeStorage = new FakeAttachmentStorage(jsonContent);
        var parser = new CycloneDxParser(fakeStorage);
        var job = new CommandProcessorJob { FilePath = "sbom.json", ProjectId = 42 };

        var result = parser.Parse(job);

        // Verify Assets
        Assert.Single(result.assets);
        var asset = result.assets.First();
        Assert.Equal("log4j-core@2.14.1", asset.Name);
        Assert.Equal("package", asset.Type);
        Assert.Contains("license:Apache-2.0", asset.Tags);
        Assert.Contains("purl:pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1", asset.Tags);

        // Verify Findings (Vulnerabilities)
        Assert.Single(result.findings);
        var finding = result.findings.First();
        Assert.Equal("CVE-2021-44228 in log4j-core@2.14.1", finding.Summary);
        Assert.Equal("Apache Log4j2 remote code execution vulnerability.", finding.Description);
        Assert.Equal("Upgrade to 2.15.0 or higher", finding.Remediation);
        Assert.Equal("high", finding.Risk);
        Assert.Equal("open", finding.Status);
        Assert.NotNull(finding.Asset);
        Assert.Equal("log4j-core@2.14.1", finding.Asset.Name);
    }
}

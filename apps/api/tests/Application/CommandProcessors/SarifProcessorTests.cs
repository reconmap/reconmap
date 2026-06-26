using System.IO;
using System.Linq;
using System.Threading.Tasks;
using api_v2.Application.CommandProcessors;
using api_v2.Application.Services;
using api_v2.Controllers;
using Xunit;

namespace tests.Application.CommandProcessors;

public class SarifProcessorTests
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
    public void Process_InvalidJson_ReturnsEmptyResult()
    {
        var fakeStorage = new FakeAttachmentStorage("{ malformed json }");
        var processor = new SarifProcessor(fakeStorage);
        var job = new CommandProcessorJob { FilePath = "test.sarif" };

        var result = processor.Process(job);

        Assert.Empty(result.findings);
        Assert.Empty(result.assets);
    }

    [Fact]
    public void Process_ValidSarifWithOneFinding_ParsesCorrectly()
    {
        var sarifContent = @"{
          ""$schema"": ""https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json"",
          ""version"": ""2.1.0"",
          ""runs"": [
            {
              ""tool"": {
                ""driver"": {
                  ""name"": ""gosec"",
                  ""rules"": [
                    {
                      ""id"": ""G104"",
                      ""name"": ""AuditErrors"",
                      ""shortDescription"": {
                        ""text"": ""Errors unhandled""
                      },
                      ""fullDescription"": {
                        ""text"": ""Audit unhandled errors in Go code.""
                      },
                      ""helpUri"": ""https://securego.io/rule-details.html#G104""
                    }
                  ]
                }
              },
              ""results"": [
                {
                  ""ruleId"": ""G104"",
                  ""ruleIndex"": 0,
                  ""level"": ""error"",
                  ""message"": {
                    ""text"": ""Unhandled error detected.""
                  },
                  ""locations"": [
                    {
                      ""physicalLocation"": {
                        ""artifactLocation"": {
                          ""uri"": ""main.go""
                        },
                        ""region"": {
                          ""startLine"": 42
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }";

        var fakeStorage = new FakeAttachmentStorage(sarifContent);
        var processor = new SarifProcessor(fakeStorage);
        var job = new CommandProcessorJob { FilePath = "test.sarif" };

        var result = processor.Process(job);

        Assert.Single(result.findings);
        var finding = result.findings.First();
        Assert.Equal("Errors unhandled", finding.Summary);
        Assert.Equal("Audit unhandled errors in Go code.", finding.Description);
        Assert.Equal("https://securego.io/rule-details.html#G104", finding.ExternalRefs);
        Assert.Equal("Locations:\nmain.go:42", finding.ProofOfConcept);
        Assert.Equal("high", finding.Risk);
    }

    [Fact]
    public void Process_SarifLevelMapping_MapsCorrectly()
    {
        var sarifContent = @"{
          ""version"": ""2.1.0"",
          ""runs"": [
            {
              ""tool"": {
                ""driver"": {
                  ""name"": ""test-tool""
                }
              },
              ""results"": [
                {
                  ""ruleId"": ""R1"",
                  ""level"": ""warning"",
                  ""message"": { ""text"": ""Warning message"" }
                },
                {
                  ""ruleId"": ""R2"",
                  ""level"": ""note"",
                  ""message"": { ""text"": ""Note message"" }
                },
                {
                  ""ruleId"": ""R3"",
                  ""level"": ""none"",
                  ""message"": { ""text"": ""None message"" }
                }
              ]
            }
          ]
        }";

        var fakeStorage = new FakeAttachmentStorage(sarifContent);
        var processor = new SarifProcessor(fakeStorage);
        var job = new CommandProcessorJob { FilePath = "test.sarif" };

        var result = processor.Process(job);

        Assert.Equal(3, result.findings.Count);
        
        var r1 = result.findings.First(f => f.Summary == "Warning message");
        Assert.Equal("medium", r1.Risk);

        var r2 = result.findings.First(f => f.Summary == "Note message");
        Assert.Equal("low", r2.Risk);

        var r3 = result.findings.First(f => f.Summary == "None message");
        Assert.Equal("none", r3.Risk);
    }
}

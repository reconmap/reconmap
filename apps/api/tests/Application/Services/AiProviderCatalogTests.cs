using api_v2.Application.Services;
using Microsoft.Extensions.Options;

namespace tests.Application.Services;

public class AiProviderCatalogTests
{
    [Fact]
    public void Constructor_RejectsDuplicateProviderIds()
    {
        var options = Options.Create(new AiProviderCatalogOptions
        {
            DefaultProvider = "one",
            Providers =
            [
                new AiProviderDefinition { Id = "one", Name = "One", Adapter = "ollama" },
                new AiProviderDefinition { Id = "ONE", Name = "Duplicate", Adapter = "ollama" }
            ]
        });

        var exception = Assert.Throws<InvalidOperationException>(() => new AiProviderCatalog(options));

        Assert.Contains("duplicated", exception.Message);
    }

    [Theory]
    [InlineData("unknown", null)]
    [InlineData("openai-compatible", "relative")]
    public void Constructor_RejectsInvalidAdapterConfiguration(string adapter, string? endpoint)
    {
        var options = Options.Create(new AiProviderCatalogOptions
        {
            DefaultProvider = "provider",
            Providers =
            [
                new AiProviderDefinition
                {
                    Id = "provider", Name = "Provider", Adapter = adapter, Endpoint = endpoint
                }
            ]
        });

        Assert.Throws<InvalidOperationException>(() => new AiProviderCatalog(options));
    }
}

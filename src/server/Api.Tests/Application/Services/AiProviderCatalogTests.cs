using Reconmap.Api.Application.Services;
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

    [Fact]
    public void Constructor_AcceptsModelFieldWithCapabilityAndVerifiedModels()
    {
        var catalog = new AiProviderCatalog(Options.Create(new AiProviderCatalogOptions
        {
            DefaultProvider = "provider",
            Providers =
            [
                new AiProviderDefinition
                {
                    Id = "provider", Name = "Provider", Adapter = "openai-compatible",
                    Endpoint = "https://example.com/v1",
                    Fields =
                    [
                        new AiProviderFieldDefinition
                        {
                            Key = "model", Label = "Model", Type = "model", Capability = "chat",
                            DefaultValue = "vendor/auto"
                        }
                    ],
                    VerifiedModels =
                    [
                        new AiProviderModelDefinition
                        {
                            Id = "vendor/auto",
                            InputModalities = ["text"],
                            ReasoningEfforts = ["low", "high"]
                        }
                    ]
                }
            ]
        }));

        Assert.Equal("model", catalog.GetProvider("provider").Fields.Single().Type);
        Assert.Equal("chat", catalog.GetProvider("provider").Fields.Single().Capability);
        var verified = catalog.GetProvider("provider").VerifiedModels.Single();
        Assert.Equal(["text"], verified.InputModalities);
        Assert.Equal(["low", "high"], verified.ReasoningEfforts);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("telepathy")]
    public void Constructor_RejectsModelFieldWithoutSupportedCapability(string? capability)
    {
        var options = Options.Create(new AiProviderCatalogOptions
        {
            DefaultProvider = "provider",
            Providers =
            [
                new AiProviderDefinition
                {
                    Id = "provider", Name = "Provider", Adapter = "openai-compatible",
                    Endpoint = "https://example.com/v1",
                    Fields =
                    [
                        new AiProviderFieldDefinition
                        {
                            Key = "model", Label = "Model", Type = "model", Capability = capability
                        }
                    ]
                }
            ]
        });

        var exception = Assert.Throws<InvalidOperationException>(() => new AiProviderCatalog(options));

        Assert.Contains("requires a supported capability", exception.Message);
    }

    [Fact]
    public void Constructor_RejectsDuplicateVerifiedModels()
    {
        var options = Options.Create(new AiProviderCatalogOptions
        {
            DefaultProvider = "provider",
            Providers =
            [
                new AiProviderDefinition
                {
                    Id = "provider", Name = "Provider", Adapter = "openai-compatible",
                    Endpoint = "https://example.com/v1",
                    VerifiedModels =
                    [
                        new AiProviderModelDefinition { Id = "vendor/auto" },
                        new AiProviderModelDefinition { Id = "vendor/auto" }
                    ]
                }
            ]
        });

        var exception = Assert.Throws<InvalidOperationException>(() => new AiProviderCatalog(options));

        Assert.Contains("duplicate verified model", exception.Message);
    }
}

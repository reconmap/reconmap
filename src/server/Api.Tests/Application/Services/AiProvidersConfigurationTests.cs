using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Reconmap.Api.Application.Services;

namespace Api.Tests.Application.Services;

/// <summary>
/// Guards the shipped <c>ai-providers.json</c>: the file is the provider registry, so a typo in it
/// breaks the API at startup. These tests load the real file rather than a hand-built definition.
/// </summary>
public class AiProvidersConfigurationTests
{
    private static AiProviderDefinition OrcaRouter()
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile(Path.Combine(AppContext.BaseDirectory, "ai-providers.json"), optional: false)
            .Build();
        var options = configuration.GetSection("AiProviders").Get<AiProviderCatalogOptions>();
        Assert.NotNull(options);
        var catalog = new AiProviderCatalog(Options.Create(options!));
        return catalog.GetProvider("OrcaRouter");
    }

    [Fact]
    public void OrcaRouter_IsRegisteredAsAnOpenAiCompatibleProviderWithTheGatewayEndpoint()
    {
        var provider = OrcaRouter();

        Assert.Equal("OrcaRouter Cyber Inference", provider.Name);
        Assert.Equal("openai-compatible", provider.Adapter);
        Assert.Equal("https://api.orcarouter.ai/v1", provider.Endpoint);
    }

    [Fact]
    public void OrcaRouter_UsesTheSharedSecretFieldAndDiscoversItsModelCatalog()
    {
        var provider = OrcaRouter();

        var apiKey = provider.Fields.Single(field => field.Key == "apiKey");
        Assert.Equal("secret", apiKey.Type);
        Assert.True(apiKey.Required);

        var model = provider.Fields.Single(field => field.Key == "model");
        Assert.Equal("model", model.Type);
        Assert.Equal("chat", model.Capability);
        Assert.Equal("orcarouter/auto", model.DefaultValue);
    }

    [Fact]
    public void OrcaRouter_DefaultModelIsInTheVerifiedFallbackCatalog()
    {
        var provider = OrcaRouter();

        Assert.Contains(provider.VerifiedModels, model => model.Id == "orcarouter/auto");
        Assert.Contains(provider.VerifiedModels, model => model.Id == "orcarouter/fusion");
        Assert.Contains(provider.VerifiedModels, model => model.Id == "orca/orcacyber-ultra-1.0");
        Assert.Contains(provider.VerifiedModels, model => model.Id == "orca/orcacyber-zero-1.5");
    }

    [Fact]
    public void OrcaRouter_VerifiedFallbackKeepsModalityMetadata()
    {
        var provider = OrcaRouter();

        var auto = provider.VerifiedModels.Single(model => model.Id == "orcarouter/auto");
        Assert.Equal(["text"], auto.InputModalities);
        Assert.All(provider.VerifiedModels, model =>
        {
            Assert.False(string.IsNullOrWhiteSpace(model.Id));
            Assert.NotEmpty(model.InputModalities);
        });
    }
}

using api_v2.Application.Services;

namespace tests.Application.Services;

public class ProcessorIntegrationDiscoveryTests
{
    // InferNames uses OrdinalIgnoreCase in the processor map, so camelCase
    // lookups rely on a matching key existing in the returned names.

    [Theory]
    [InlineData("NmapProcessor", "nmap")]
    [InlineData("GenericLlmProcessor", "genericLlm")]
    [InlineData("TestsslProcessor", "testssl")]
    [InlineData("SubfinderProcessor", "subfinder")]
    [InlineData("ShcheckProcessor", "shcheck")]
    public void InferNames_CamelCaseNameMatchesViaOrdinalIgnoreCase(string className, string camelCaseName)
    {
        var names = ProcessorIntegrationDiscovery.InferNames(className);

        Assert.Contains(names, n => n.Equals(camelCaseName, StringComparison.OrdinalIgnoreCase));
    }

    [Theory]
    [InlineData("NmapProcessor", "NmapProcessor")]
    [InlineData("NmapProcessor", "Nmap")]
    [InlineData("GenericLlmProcessor", "GenericLlmProcessor")]
    [InlineData("GenericLlmProcessor", "GenericLlm")]
    [InlineData("TestsslProcessor", "Testssl")]
    public void InferNames_IncludesExpectedAliases(string className, string expectedAlias)
    {
        var names = ProcessorIntegrationDiscovery.InferNames(className);

        Assert.Contains(names, n => string.Equals(n, expectedAlias, StringComparison.Ordinal));
    }

    [Theory]
    [InlineData("NmapScanProcessor", "Nmap")]
    public void InferNames_FirstSegmentExtractedForMultiWordClass(string className, string expectedFirstSegment)
    {
        var names = ProcessorIntegrationDiscovery.InferNames(className);

        Assert.Contains(names, n => string.Equals(n, expectedFirstSegment, StringComparison.Ordinal));
    }

    [Fact]
    public void InferNames_SingleWordProcessor_DoesNotDuplicateFirstSegment()
    {
        // For NmapProcessor, baseName == firstSegment == "Nmap", so it should
        // appear exactly once, not twice.
        var names = ProcessorIntegrationDiscovery.InferNames("NmapProcessor").ToList();

        Assert.Equal(1, names.Count(n => string.Equals(n, "Nmap", StringComparison.Ordinal)));
    }

    [Fact]
    public void InferNames_MultiWordProcessor_YieldsBothBaseNameAndFirstSegment()
    {
        // GenericLlmProcessor -> baseName="GenericLlm", firstSegment="Generic"
        var names = ProcessorIntegrationDiscovery.InferNames("GenericLlmProcessor").ToList();

        Assert.Contains("GenericLlm", names);
        Assert.Contains("Generic", names);
    }
}

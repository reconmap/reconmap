using api_v2.Application.Services;

namespace tests.Application.Services;

public class CommandParserDiscoveryTests
{
    // InferNames uses OrdinalIgnoreCase in the parser map, so camelCase
    // lookups rely on a matching key existing in the returned names.

    [Theory]
    [InlineData("NmapParser", "nmap")]
    [InlineData("GenericLlmParser", "genericLlm")]
    [InlineData("TestsslParser", "testssl")]
    [InlineData("SubfinderParser", "subfinder")]
    [InlineData("ShcheckParser", "shcheck")]
    [InlineData("SarifParser", "sarif")]
    public void InferNames_CamelCaseNameMatchesViaOrdinalIgnoreCase(string className, string camelCaseName)
    {
        var names = CommandParserDiscovery.InferNames(className);

        Assert.Contains(names, n => n.Equals(camelCaseName, StringComparison.OrdinalIgnoreCase));
    }

    [Theory]
    [InlineData("NmapParser", "NmapParser")]
    [InlineData("NmapParser", "Nmap")]
    [InlineData("GenericLlmParser", "GenericLlmParser")]
    [InlineData("GenericLlmParser", "GenericLlm")]
    [InlineData("TestsslParser", "Testssl")]
    public void InferNames_IncludesExpectedAliases(string className, string expectedAlias)
    {
        var names = CommandParserDiscovery.InferNames(className);

        Assert.Contains(names, n => string.Equals(n, expectedAlias, StringComparison.Ordinal));
    }

    [Theory]
    [InlineData("NmapScanParser", "Nmap")]
    public void InferNames_FirstSegmentExtractedForMultiWordClass(string className, string expectedFirstSegment)
    {
        var names = CommandParserDiscovery.InferNames(className);

        Assert.Contains(names, n => string.Equals(n, expectedFirstSegment, StringComparison.Ordinal));
    }

    [Fact]
    public void InferNames_SingleWordParser_DoesNotDuplicateFirstSegment()
    {
        // For NmapParser, baseName == firstSegment == "Nmap", so it should
        // appear exactly once, not twice.
        var names = CommandParserDiscovery.InferNames("NmapParser").ToList();

        Assert.Equal(1, names.Count(n => string.Equals(n, "Nmap", StringComparison.Ordinal)));
    }

    [Fact]
    public void InferNames_MultiWordParser_YieldsBothBaseNameAndFirstSegment()
    {
        // GenericLlmParser -> baseName="GenericLlm", firstSegment="Generic"
        var names = CommandParserDiscovery.InferNames("GenericLlmParser").ToList();

        Assert.Contains("GenericLlm", names);
        Assert.Contains("Generic", names);
    }
}

using System.Linq;
using api_v2.Application.Commands;
using Xunit;

namespace tests.Application.Services;

public class CommandDiscoveryTests
{
    [Fact]
    public void GetAll_IncludesNewSarifCommands()
    {
        var commands = CommandDiscovery.GetAll().ToList();

        Assert.Contains(commands, c => c.Id == "trivy");
        Assert.Contains(commands, c => c.Id == "semgrep");
        Assert.Contains(commands, c => c.Id == "bandit");
        Assert.Contains(commands, c => c.Id == "snyk");
        Assert.Contains(commands, c => c.Id == "syft");
    }

    [Fact]
    public void PredefinedCommands_HaveCorrectOutputParserSpecified()
    {
        var trivy = CommandDiscovery.FindById("trivy");
        Assert.NotNull(trivy);
        Assert.All(trivy.Usages, usage => Assert.Equal("sarif", usage.OutputParser));

        var semgrep = CommandDiscovery.FindById("semgrep");
        Assert.NotNull(semgrep);
        Assert.All(semgrep.Usages, usage => Assert.Equal("sarif", usage.OutputParser));

        var bandit = CommandDiscovery.FindById("bandit");
        Assert.NotNull(bandit);
        Assert.All(bandit.Usages, usage => Assert.Equal("sarif", usage.OutputParser));

        var snyk = CommandDiscovery.FindById("snyk");
        Assert.NotNull(snyk);
        Assert.All(snyk.Usages, usage => Assert.Equal("sarif", usage.OutputParser));

        var syft = CommandDiscovery.FindById("syft");
        Assert.NotNull(syft);
        Assert.All(syft.Usages, usage => Assert.Equal("cyclonedx", usage.OutputParser));
    }
}

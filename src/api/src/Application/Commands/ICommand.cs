namespace api_v2.Application.Commands;

public interface ICommand
{
    string Id { get; }
    string Name { get; }
    string Description { get; }
    string? MoreInfoUrl { get; }
    string[] Tags { get; }

    IEnumerable<CommandUsageDefinition> Usages { get; }
}

public class CommandUsageDefinition
{
    public string Id { get; set; } = string.Empty;
    public string CommandId { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ExecutablePath { get; set; }
    public string? DockerImage { get; set; }
    public string? Arguments { get; set; }
    public string OutputCapturingMode { get; set; } = "none";
    public string? OutputFilename { get; set; }
    public string? OutputParser { get; set; }
}

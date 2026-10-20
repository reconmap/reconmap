namespace Reconmap.Api.Domain.Entities;

public class CommandUsage : TimestampedEntity
{
    public string Id { get; set; } = string.Empty;

    public string CommandId { get; set; } = string.Empty;

    public int? CreatedById { get; set; }

    public User? CreatedBy { get; set; }

    public string? Description { get; set; }

    public string? ExecutablePath { get; set; }

    public string? DockerImage { get; set; }

    public string? Arguments { get; set; }

    public string? OutputCapturingMode { get; set; }

    public string? OutputFilename { get; set; }

    public string? OutputParser { get; set; }
}

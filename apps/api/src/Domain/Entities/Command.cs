namespace api_v2.Domain.Entities;

public class Command : TimestampedEntity
{
    public string Id { get; set; } = string.Empty;

    public uint CreatedByUid { get; set; }

    public User? CreatedBy { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? MoreInfoUrl { get; set; }

    public string? Tags { get; set; }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("command_usage")]
public class CommandUsage : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("command_id")] [Required] public uint CommandId { get; set; }

    [Column("created_by_uid")] public uint CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))]
    public User? CreatedBy { get; set; }

    [Column("name")] [MaxLength(2000)] public string? Name { get; set; }

    [Column("description")]
    [MaxLength(2000)]
    public string? Description { get; set; }

    [Column("tags")] public string? Tags { get; set; }

    [Column("executable_path")]
    [MaxLength(255)]
    public string? ExecutablePath { get; set; }

    [Column("docker_image")]
    [MaxLength(300)]
    public string? DockerImage { get; set; }

    [Column("arguments")]
    [MaxLength(2000)]
    public string? Arguments { get; set; }

    [Column("output_capturing_mode")]
    [Required]
    public string? OutputCapturingMode { get; set; }

    [Column("output_filename")]
    [MaxLength(100)]
    public string? OutputFilename { get; set; }

    [Column("output_parser")]
    [MaxLength(100)]
    public string? OutputParser { get; set; }
}

public enum OutputCapturingMode
{
    none,
    stdout,
    file
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("agent")]
public class Agent
{
    [Key]
    public uint Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ClientId { get; set; } = string.Empty;

    public DateTime? LastBootAt { get; set; }

    public DateTime? LastPingAt { get; set; }

    public bool Active { get; set; }

    [MaxLength(100)]
    public string? Version { get; set; }

    [MaxLength(100)]
    public string? Hostname { get; set; }

    [MaxLength(100)]
    public string? Arch { get; set; }

    [MaxLength(100)]
    public string? Cpu { get; set; }

    [MaxLength(100)]
    public string? Memory { get; set; }

    [MaxLength(100)]
    public string? Os { get; set; }

    [MaxLength(15)]
    public string? Ip { get; set; }

    [MaxLength(100)]
    public string? ListenAddr { get; set; }
}

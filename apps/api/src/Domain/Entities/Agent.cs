using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("agent")]
public class Agent
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Column("client_id")]
    [MaxLength(100)]
    public string ClientId { get; set; } = string.Empty;

    [Column("last_boot_at")] public DateTime? LastBootAt { get; set; }

    [Column("last_ping_at")] public DateTime? LastPingAt { get; set; }

    [Column("active")] public bool Active { get; set; }

    [Column("version")] [MaxLength(100)] public string? Version { get; set; }

    [Column("hostname")] [MaxLength(100)] public string? Hostname { get; set; }

    [Column("arch")] [MaxLength(100)] public string? Arch { get; set; }

    [Column("cpu")] [MaxLength(100)] public string? Cpu { get; set; }

    [Column("memory")] [MaxLength(100)] public string? Memory { get; set; }

    [Column("os")] [MaxLength(100)] public string? Os { get; set; }

    [Column("ip")] [MaxLength(15)] public string? Ip { get; set; }

    [Column("listen_addr")]
    [MaxLength(100)]
    public string? ListenAddr { get; set; }
}

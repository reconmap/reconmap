using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net;
using System.Text.Json.Serialization;

namespace api_v2.Domain.Entities;

[Table("audit_log")]
public class AuditEntry : CreationTimestampedEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("created_by_uid")] public uint? CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    [Column("user_agent")]
    [MaxLength(250)]
    public string? UserAgent { get; set; }

    [Required]
    [Column("client_ip")]
    [MinLength(4)]
    [MaxLength(16)]
    [JsonIgnore]
    public byte[] ClientIpBinary { get; set; }

    [NotMapped]
    public string ClientIp
    {
        get => new IPAddress(ClientIpBinary).ToString();
        set => ClientIpBinary = IPAddress.Parse(value).GetAddressBytes();
    }

    [Column("action")] [MaxLength(200)] public string Action { get; set; } = string.Empty;

    [Column("object")] [MaxLength(200)] public string Object { get; set; } = string.Empty;

    [Column("context")] public string? Context { get; set; }
}

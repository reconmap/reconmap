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

    public int? CreatedByUid { get; set; }

    [ForeignKey(nameof(CreatedByUid))] public UserInfo? CreatedBy { get; set; }

    [MaxLength(250)]
    public string? UserAgent { get; set; }

    [Required]
    [Column("client_ip")]
    [MinLength(4)]
    [MaxLength(16)]
    [JsonIgnore]
    public byte[] ClientIpBinary { get; set; } = null!;

    [NotMapped]
    public string ClientIp
    {
        get => new IPAddress(ClientIpBinary).ToString();
        set => ClientIpBinary = IPAddress.Parse(value).GetAddressBytes();
    }

    [MaxLength(200)] public string Action { get; set; } = string.Empty;

    [MaxLength(200)] public string Object { get; set; } = string.Empty;

    [Column(TypeName = "jsonb")] public string? Context { get; set; }
}

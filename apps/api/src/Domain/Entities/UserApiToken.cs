using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("user_api_token")]
public class UserApiToken
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("user_id")] public uint UserId { get; set; }

    [Column("created_at", TypeName = "timestamp")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime CreatedAt { get; set; }

    [Column("expires_at", TypeName = "timestamp")]
    public DateTime ExpiresAt { get; set; }

    [Column("name")] [MaxLength(100)] public string Name { get; set; } = null!;

    [Column("token")] [MaxLength(128)] public string Token { get; set; } = null!;

    [Column("scope")] public ApiTokenScope Scope { get; set; }
}

public enum ApiTokenScope
{
    [Display(Name = "full")] Full,
    [Display(Name = "read-only")] Read_Only
}

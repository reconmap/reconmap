using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("user_api_token")]
public class UserApiToken
{
    [Key] public int Id { get; set; }

    public int UserId { get; set; }

    [Column(TypeName = "timestamptz")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "timestamptz")]
    public DateTime ExpiresAt { get; set; }

    [MaxLength(100)] public string Name { get; set; } = null!;

    [MaxLength(128)] public string Token { get; set; } = null!;

    public ApiTokenScope Scope { get; set; }
}

public enum ApiTokenScope
{
    [Display(Name = "full")] Full,
    [Display(Name = "read-only")] Read_Only
}

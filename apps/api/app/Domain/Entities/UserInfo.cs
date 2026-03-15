using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("user_info")]
public class UserInfo
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public uint Id { get; set; }

    [Required]
    [Column("email")]
    [StringLength(200)]
    public string Email { get; set; } = default!;

    [Required]
    [Column("username")]
    [StringLength(80)]
    public string Username { get; set; } = default!;

    [Required]
    [Column("first_name")]
    [StringLength(100)]
    public string FirstName { get; set; } = default!;

    [Required]
    [Column("last_name")]
    [StringLength(100)]
    public string LastName { get; set; } = default!;

    [Column("role")] public UserRole Role { get; set; } = UserRole.User;

    // Computed column in SQL (VIRTUAL GENERATED)
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [Column("full_name")]
    [StringLength(210)]
    public string? FullName { get; private set; }

    [Column("short_bio")]
    [StringLength(1000)]
    public string? ShortBio { get; set; }
}

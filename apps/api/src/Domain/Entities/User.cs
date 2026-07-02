using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("user")]
public class User : TimestampedEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public uint Id { get; set; }

    [Column("last_login_ts")] public DateTime? LastLoginAt { get; set; }

    [StringLength(40)]
    public string? SubjectId { get; set; } = default!;

    public bool Active { get; set; } = true;

    [Required]
    [StringLength(200)]
    public string Email { get; set; } = default!;

    [Required]
    [StringLength(80)]
    public string Username { get; set; } = default!;

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = default!;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = default!;

    public UserRole Role { get; set; } = UserRole.User;

    // Computed column in SQL
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [StringLength(210)]
    public string? FullName { get; private set; }

    [StringLength(1000)]
    public string? ShortBio { get; set; }

    [Required]
    [Column("timezone")]
    [StringLength(200)]
    public string TimeZone { get; set; } = "UTC";

    public bool MfaEnabled { get; set; } = false;

    [Column(TypeName = "jsonb")] public string? Preferences { get; set; }
}

public enum UserRole
{
    Administrator,
    Superuser,
    User,
    Client
}

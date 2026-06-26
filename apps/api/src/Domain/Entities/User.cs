using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("user")]
public class User : TimestampedEntity
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public uint Id { get; set; }

    [Column("last_login_ts")] public DateTime? LastLoginAt { get; set; }

    [Column("subject_id")]
    [StringLength(40)]
    public string? SubjectId { get; set; } = default!;

    [Required] [Column("active")] public bool Active { get; set; } = true;

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

    [Required]
    [Column("timezone")]
    [StringLength(200)]
    public string TimeZone { get; set; } = "UTC";

    [Required] [Column("mfa_enabled")] public bool MfaEnabled { get; set; } = false;

    [Column("preferences")] public string? Preferences { get; set; }
}

public enum UserRole
{
    Administrator,
    Superuser,
    User,
    Client
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api_v2.Domain.Identity;

namespace api_v2.Domain.Entities;

[Table("user")]
public class User : IKeycloakIdentity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(40)]
    public string SubjectId { get; set; } = default!;

    public UserRole Role { get; set; } = UserRole.User;

    [StringLength(1000)]
    public string? ShortBio { get; set; }

    [Column(TypeName = "jsonb")] public string? Preferences { get; set; }

    // Identity fields, owned by Keycloak. Filled in when a response is built.
    [NotMapped] public string Username { get; set; } = string.Empty;
    [NotMapped] public string Email { get; set; } = string.Empty;
    [NotMapped] public string FirstName { get; set; } = string.Empty;
    [NotMapped] public string LastName { get; set; } = string.Empty;
    [NotMapped] public string FullName => $"{FirstName} {LastName}".Trim();
    [NotMapped] public bool Active { get; set; } = true;
    [NotMapped] public DateTime? CreatedAt { get; set; }
    [NotMapped] public DateTime? UpdatedAt { get; set; }
    [NotMapped] public string? Locale { get; set; }
    [NotMapped] public string TimeZone { get; set; } = "UTC";
    [NotMapped] public bool MfaEnabled { get; set; }
    [NotMapped] public DateTime? LastLoginAt { get; set; }

    void IKeycloakIdentity.ApplyKeycloakUser(KeycloakUser user) => ApplyKeycloakUser(user);

    public void ApplyKeycloakUser(KeycloakUser user)
    {
        Username = user.Username;
        Email = user.Email;
        FirstName = user.FirstName;
        LastName = user.LastName;
        Active = user.Enabled;
        CreatedAt = user.CreatedAt;
        UpdatedAt = user.UpdatedAt;
        Locale = user.Locale;
        TimeZone = user.TimeZone ?? "UTC";
    }
}

public enum UserRole
{
    Administrator,
    Superuser,
    User,
    Client
}

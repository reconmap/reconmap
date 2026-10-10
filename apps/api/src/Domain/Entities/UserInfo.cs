using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using api_v2.Domain.Identity;

namespace api_v2.Domain.Entities;

[Table("user_info")]
public class UserInfo : IKeycloakIdentity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [StringLength(40)]
    public string? SubjectId { get; set; }

    public UserRole Role { get; set; } = UserRole.User;

    [StringLength(1000)]
    public string? ShortBio { get; set; }

    // Identity fields, owned by Keycloak. Filled in when a response is built.
    [NotMapped] public string Username { get; set; } = string.Empty;
    [NotMapped] public string Email { get; set; } = string.Empty;
    [NotMapped] public string FirstName { get; set; } = string.Empty;
    [NotMapped] public string LastName { get; set; } = string.Empty;
    [NotMapped] public string FullName => $"{FirstName} {LastName}".Trim();

    void IKeycloakIdentity.ApplyKeycloakUser(KeycloakUser user) => ApplyKeycloakUser(user);

    public void ApplyKeycloakUser(KeycloakUser user)
    {
        Username = user.Username;
        Email = user.Email;
        FirstName = user.FirstName;
        LastName = user.LastName;
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("user_info")]
public class UserInfo
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

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

    // Computed column in SQL (VIRTUAL GENERATED)
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    [StringLength(210)]
    public string? FullName { get; private set; }

    [StringLength(1000)]
    public string? ShortBio { get; set; }
}

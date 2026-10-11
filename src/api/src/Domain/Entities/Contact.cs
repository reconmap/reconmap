using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("contact")]
public class Contact
{
    [Key] public int Id { get; set; }

    public int OrganisationId { get; set; }

    [Required] public string? Kind { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = null!;

    [MaxLength(200)] public string? Phone { get; set; }

    [MaxLength(200)] public string? Role { get; set; }
}

public enum ContactKind
{
    general,
    technical,
    billing
}

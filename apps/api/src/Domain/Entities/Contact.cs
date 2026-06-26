using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("contact")]
public class Contact
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Column("organisation_id")] public uint OrganisationId { get; set; }

    [Column("kind")] [Required] public string? Kind { get; set; }

    [Column("name")]
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = null!;

    [Column("email")]
    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = null!;

    [Column("phone")] [MaxLength(200)] public string? Phone { get; set; }

    [Column("role")] [MaxLength(200)] public string? Role { get; set; }
}

public enum ContactKind
{
    general,
    technical,
    billing
}

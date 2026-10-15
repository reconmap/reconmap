using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

[Table("notification")]
public class Notification : TimestampedEntity
{
    [Key] public int Id { get; set; }

    [Required] public int ToUserId { get; set; }

    [MaxLength(200)] public string? Title { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = string.Empty;

    [Required] public string? Status { get; set; }
}

public enum NotificationStatus
{
    unread,
    read
}
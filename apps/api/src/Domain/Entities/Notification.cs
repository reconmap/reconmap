using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("notification")]
public class Notification : TimestampedEntity
{
    [Key] [Column("id")] public uint Id { get; set; }

    [Required] [Column("to_user_id")] public uint ToUserId { get; set; }

    [MaxLength(200)] [Column("title")] public string? Title { get; set; }

    [Required]
    [MaxLength(4000)]
    [Column("content")]
    public string Content { get; set; } = string.Empty;

    [Required] [Column("status")] public string? Status { get; set; }
}

public enum NotificationStatus
{
    unread,
    read
}
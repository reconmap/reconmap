using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("mail_settings")]
public class MailSettings : TimestampedEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public uint Id { get; set; } = 1;

    [MaxLength(255)]
    public string? SmtpHost { get; set; }

    public int? SmtpPort { get; set; }

    [MaxLength(255)]
    public string? SmtpUsername { get; set; }

    public string? SmtpPassword { get; set; }

    [MaxLength(255)]
    public string? SmtpFromEmail { get; set; }

    [MaxLength(255)]
    public string? SmtpFromName { get; set; }

    public bool SmtpUseSsl { get; set; } = true;

    [MaxLength(255)]
    public string? ImapHost { get; set; }

    public int? ImapPort { get; set; }

    [MaxLength(255)]
    public string? ImapUsername { get; set; }

    public string? ImapPassword { get; set; }

    public bool ImapUseSsl { get; set; } = true;
}

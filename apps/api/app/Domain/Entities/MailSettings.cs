using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_v2.Domain.Entities;

[Table("mail_settings")]
public class MailSettings : TimestampedEntity
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public uint Id { get; set; } = 1;

    [Column("smtp_host")]
    [MaxLength(255)]
    public string? SmtpHost { get; set; }

    [Column("smtp_port")]
    public int? SmtpPort { get; set; }

    [Column("smtp_username")]
    [MaxLength(255)]
    public string? SmtpUsername { get; set; }

    [Column("smtp_password")]
    public string? SmtpPassword { get; set; }

    [Column("smtp_from_email")]
    [MaxLength(255)]
    public string? SmtpFromEmail { get; set; }

    [Column("smtp_from_name")]
    [MaxLength(255)]
    public string? SmtpFromName { get; set; }

    [Column("smtp_use_ssl")]
    public bool SmtpUseSsl { get; set; } = true;

    [Column("imap_host")]
    [MaxLength(255)]
    public string? ImapHost { get; set; }

    [Column("imap_port")]
    public int? ImapPort { get; set; }

    [Column("imap_username")]
    [MaxLength(255)]
    public string? ImapUsername { get; set; }

    [Column("imap_password")]
    public string? ImapPassword { get; set; }

    [Column("imap_use_ssl")]
    public bool ImapUseSsl { get; set; } = true;
}

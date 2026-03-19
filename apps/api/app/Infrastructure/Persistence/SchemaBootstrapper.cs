using Microsoft.EntityFrameworkCore;

namespace api_v2.Infrastructure.Persistence;

public static class SchemaBootstrapper
{
    public static async Task EnsureAuxiliaryTablesAsync(this IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS mail_settings
            (
                id               INT UNSIGNED NOT NULL,
                created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at       TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                smtp_host        VARCHAR(255) NULL,
                smtp_port        INT NULL,
                smtp_username    VARCHAR(255) NULL,
                smtp_password    TEXT NULL,
                smtp_from_email  VARCHAR(255) NULL,
                smtp_from_name   VARCHAR(255) NULL,
                smtp_use_ssl     BOOLEAN      NOT NULL DEFAULT TRUE,
                imap_host        VARCHAR(255) NULL,
                imap_port        INT NULL,
                imap_username    VARCHAR(255) NULL,
                imap_password    TEXT NULL,
                imap_use_ssl     BOOLEAN      NOT NULL DEFAULT TRUE,
                PRIMARY KEY (id)
            ) ENGINE = InnoDB;
            """);
    }
}

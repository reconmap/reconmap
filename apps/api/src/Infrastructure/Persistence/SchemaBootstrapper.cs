using Microsoft.EntityFrameworkCore;

namespace api_v2.Infrastructure.Persistence;

public static class SchemaBootstrapper
{
    public static async Task EnsureAiSettingsSchemaAsync(this IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.ExecuteSqlRawAsync(
            """
            ALTER TABLE ai_settings
                ADD COLUMN IF NOT EXISTS anonrouter_api_key TEXT NULL,
                ADD COLUMN IF NOT EXISTS anonrouter_model VARCHAR(255) NULL;
            """);
    }
}

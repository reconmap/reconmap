using Microsoft.EntityFrameworkCore;

namespace Reconmap.Api.Infrastructure.Persistence;

public static class DbExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("PostgreSqlConnection");
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention());
        return services;
    }
}

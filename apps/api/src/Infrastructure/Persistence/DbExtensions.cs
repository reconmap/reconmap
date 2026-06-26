using Microsoft.EntityFrameworkCore;

namespace api_v2.Infrastructure.Persistence;

public static class DbExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("MySqlConnection");
        services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(connectionString,
                ServerVersion.AutoDetect(connectionString)
            ));
        return services;
    }
}

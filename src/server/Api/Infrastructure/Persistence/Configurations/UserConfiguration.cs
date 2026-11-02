using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Infrastructure.Persistence.Configurations;

internal static class UserRoleConverter
{
    public static readonly ValueConverter<UserRole, string> Instance = new(
        v => v.ToString().ToLower(), // C# enum → DB string
        v => Enum.Parse<UserRole>(v, true)
    );
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(d => d.Role).HasConversion(UserRoleConverter.Instance);
    }
}

public class UserInfoConfiguration : IEntityTypeConfiguration<UserInfo>
{
    public void Configure(EntityTypeBuilder<UserInfo> builder)
    {
        builder.Property(d => d.Role).HasConversion(UserRoleConverter.Instance);
    }
}

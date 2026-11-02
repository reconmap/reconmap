using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Infrastructure.Persistence.Configurations;

public class UserApiTokenConfiguration : IEntityTypeConfiguration<UserApiToken>
{
    public void Configure(EntityTypeBuilder<UserApiToken> builder)
    {
        builder.Property(t => t.Scope).HasConversion(
            v => v.ToString().ToLower().Replace("_", "-"),
            v => Enum.Parse<ApiTokenScope>(v.Replace("-", "_"), true)
        );
    }
}

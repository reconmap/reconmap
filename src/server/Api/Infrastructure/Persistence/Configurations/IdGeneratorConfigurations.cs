using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Reconmap.Api.Domain.Entities;

namespace Reconmap.Api.Infrastructure.Persistence.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.Property(e => e.Id).HasValueGenerator<GuidV7ValueGenerator>();
    }
}

public class ProjectTaskConfiguration : IEntityTypeConfiguration<ProjectTask>
{
    public void Configure(EntityTypeBuilder<ProjectTask> builder)
    {
        builder.Property(e => e.Id).HasValueGenerator<GuidV7ValueGenerator>();
    }
}

public class ReportConfiguration : IEntityTypeConfiguration<Report>
{
    public void Configure(EntityTypeBuilder<Report> builder)
    {
        builder.Property(e => e.Id).HasValueGenerator<GuidV7ValueGenerator>();
    }
}

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.Property(e => e.Id).HasValueGenerator<GuidV7ValueGenerator>();
        // Declared explicitly (there is no navigation property) so EF orders inserts parent-first, e.g. on import.
        builder.HasOne<Asset>()
            .WithMany()
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class FindingConfiguration : IEntityTypeConfiguration<Finding>
{
    public void Configure(EntityTypeBuilder<Finding> builder)
    {
        builder.Property(e => e.Id).HasValueGenerator<GuidV4ValueGenerator>();
    }
}

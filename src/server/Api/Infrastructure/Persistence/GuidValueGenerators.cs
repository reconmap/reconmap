using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ValueGeneration;

namespace Reconmap.Api.Infrastructure.Persistence;

/// <summary>Time-ordered UUIDv7 ids, for entities where leaking the creation time is acceptable.</summary>
public class GuidV7ValueGenerator : ValueGenerator<Guid>
{
    public override bool GeneratesTemporaryValues => false;

    public override Guid Next(EntityEntry entry) => Guid.CreateVersion7();
}

/// <summary>Random UUIDv4 ids, for entities whose creation time must not be derivable from the id.</summary>
public class GuidV4ValueGenerator : ValueGenerator<Guid>
{
    public override bool GeneratesTemporaryValues => false;

    public override Guid Next(EntityEntry entry) => Guid.NewGuid();
}

namespace Reconmap.Api.Application.Services;

public sealed record Paging(int Offset, int Limit)
{
    public static readonly Paging Unbounded = new(0, int.MaxValue);
}

public sealed record PagedResult<T>(IReadOnlyList<T> Data, int TotalCount);

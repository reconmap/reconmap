/// <summary>Readable, deterministic GUIDs for tests: <c>TestIds.Of(7)</c> is always the same id.</summary>
public static class TestIds
{
    public static Guid Of(int n) => new(n, 0, 0, new byte[8]);
}

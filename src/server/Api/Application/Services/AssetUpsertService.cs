using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Reconmap.Api.Domain.Entities;
using Reconmap.Api.Infrastructure.Persistence;

namespace Reconmap.Api.Application.Services;

public interface IAssetUpsertService
{
    /// <summary>Persists a candidate tree under <paramref name="parentId"/> and returns the new nodes' count.</summary>
    Task<int> UpsertTreeAsync(Guid projectId, Guid? parentId, IEnumerable<Asset> candidates, string? source,
        CancellationToken ct = default);

    /// <summary>Finds or creates the node a candidate stands for (ignoring its children).</summary>
    Task<(Asset Asset, bool Created)> UpsertAsync(Guid projectId, Guid? parentId, Asset candidate, string? source,
        CancellationToken ct = default);
}

/// <summary>
/// Idempotent, per-node ingestion of discovered assets. A node is identified by its label under its parent,
/// so re-discovering it only refreshes <c>last_seen_at</c> and merges attributes.
/// </summary>
public class AssetUpsertService(AppDbContext db) : IAssetUpsertService
{
    public async Task<int> UpsertTreeAsync(Guid projectId, Guid? parentId, IEnumerable<Asset> candidates,
        string? source, CancellationToken ct = default)
    {
        var created = 0;
        foreach (var candidate in candidates)
        {
            var (asset, wasCreated) = await UpsertAsync(projectId, parentId, candidate, source, ct);
            if (wasCreated) created++;

            created += await UpsertTreeAsync(projectId, asset.Id, candidate.Children, source, ct);
        }

        return created;
    }

    public async Task<(Asset Asset, bool Created)> UpsertAsync(Guid projectId, Guid? parentId, Asset candidate,
        string? source, CancellationToken ct = default)
    {
        var name = candidate.Name.Trim();
        var type = string.IsNullOrWhiteSpace(candidate.Type) ? null : candidate.Type.Trim().ToLowerInvariant();
        var now = DateTime.UtcNow;

        var existing = await db.Assets.FirstOrDefaultAsync(
            a => a.ProjectId == projectId && a.ParentId == parentId && a.Name == name, ct);

        if (existing != null)
        {
            existing.LastSeenAt = now;
            existing.Type ??= type;
            existing.Source ??= source ?? candidate.Source;
            existing.Attributes = MergeAttributes(existing.Attributes, candidate.Attributes);
            await db.SaveChangesAsync(ct);
            return (existing, false);
        }

        var asset = new Asset
        {
            ProjectId = projectId,
            ParentId = parentId,
            Name = name,
            Type = type,
            Source = source ?? candidate.Source,
            Attributes = candidate.Attributes,
            Tags = candidate.Tags,
            FirstSeenAt = now,
            LastSeenAt = now
        };
        db.Assets.Add(asset);
        await db.SaveChangesAsync(ct);
        return (asset, true);
    }

    internal static string? MergeAttributes(string? current, string? incoming)
    {
        if (string.IsNullOrWhiteSpace(incoming)) return current;
        if (string.IsNullOrWhiteSpace(current)) return incoming;

        try
        {
            if (JsonNode.Parse(current) is not JsonObject merged || JsonNode.Parse(incoming) is not JsonObject extra)
                return current;

            foreach (var (key, value) in extra.ToArray())
            {
                extra.Remove(key);
                merged[key] = value;
            }

            return merged.ToJsonString();
        }
        catch (System.Text.Json.JsonException)
        {
            return current;
        }
    }
}

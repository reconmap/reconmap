using api_v2.Common;
using api_v2.Domain.Entities;
using api_v2.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api_v2.Application.Services;

public interface ISecretsService
{
    Task<Secret> CreateAsync(uint ownerId, string password, string name, string type, string value, string? note, uint? projectId, CancellationToken cancellationToken = default);
    Task<Secret?> GetByIdAsync(uint id, CancellationToken cancellationToken = default);
    Task<List<Secret>> GetManyAsync(int limit, CancellationToken cancellationToken = default);
    Task<(Secret Secret, string Value)?> DecryptAsync(uint id, string password, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(uint id, string password, string name, string type, string value, string? note, uint? projectId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(uint id, CancellationToken cancellationToken = default);
}

public sealed class SecretsService(AppDbContext db) : ISecretsService
{
    private readonly DataEncryptor _encryptor = new();

    public async Task<Secret> CreateAsync(uint ownerId, string password, string name, string type, string value, string? note, uint? projectId, CancellationToken cancellationToken = default)
    {
        var (iv, tag, cypher) = _encryptor.Encrypt(value, password);
        var secret = new Secret
        {
            OwnerUid = ownerId,
            Value = cypher,
            Iv = iv,
            Tag = tag,
            Name = name,
            Type = type,
            Note = note,
            ProjectId = projectId
        };

        db.Secrets.Add(secret);
        await db.SaveChangesAsync(cancellationToken);
        return secret;
    }

    public async Task<Secret?> GetByIdAsync(uint id, CancellationToken cancellationToken = default)
    {
        return await db.Secrets.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<List<Secret>> GetManyAsync(int limit, CancellationToken cancellationToken = default)
    {
        const int maxLimit = 500;
        var take = Math.Min(limit, maxLimit);

        return await db.Secrets.AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<(Secret Secret, string Value)?> DecryptAsync(uint id, string password, CancellationToken cancellationToken = default)
    {
        var secret = await db.Secrets.FindAsync(new object[] { id }, cancellationToken);
        if (secret == null) return null;

        var value = _encryptor.Decrypt(secret.Value, secret.Iv, password, secret.Tag);
        if (value == null) return null;

        return (secret, value);
    }

    public async Task<bool> UpdateAsync(uint id, string password, string name, string type, string value, string? note, uint? projectId, CancellationToken cancellationToken = default)
    {
        var secret = await db.Secrets.FindAsync(new object[] { id }, cancellationToken);
        if (secret == null) return false;

        var decryptedValue = _encryptor.Decrypt(secret.Value, secret.Iv, password, secret.Tag);
        if (decryptedValue == null) return false;

        var (iv, tag, cypher) = _encryptor.Encrypt(value, password);
        secret.Value = cypher;
        secret.Iv = iv;
        secret.Tag = tag;
        secret.Name = name;
        secret.Type = type;
        secret.Note = note;
        secret.ProjectId = projectId;

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(uint id, CancellationToken cancellationToken = default)
    {
        var secret = await db.Secrets.FindAsync(new object[] { id }, cancellationToken);
        if (secret == null) return false;

        db.Secrets.Remove(secret);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

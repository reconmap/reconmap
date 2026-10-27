namespace Reconmap.Api.Common;

public class StorageSettings
{
    public S3Settings S3 { get; set; } = new();
    public UploadSettings Uploads { get; set; } = new();
}

public class S3Settings
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "attachments";
    public bool UseHttp { get; set; } = true;
}

/// <summary>
/// Limits applied to files uploaded to the API. Set by the administrator in the API configuration
/// (<c>Storage:Uploads</c>), never by end users.
/// </summary>
public class UploadSettings
{
    public static readonly string[] DefaultAllowedExtensions =
    [
        ".pdf", ".txt", ".md", ".log", ".csv", ".json", ".xml", ".yaml", ".yml",
        ".png", ".jpg", ".jpeg", ".gif", ".webp",
        ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp",
        ".zip", ".gz", ".tar", ".7z", ".pcap", ".pcapng"
    ];

    public const long MaxConfigurableFileSizeBytes = int.MaxValue;

    /// <summary>Maximum size of each uploaded attachment.</summary>
    public long MaxFileSizeBytes { get; set; } = 20 * 1024 * 1024;

    /// <summary>Maximum number of files accepted in a single attachment upload request.</summary>
    public int MaxFilesPerRequest { get; set; } = 10;

    /// <summary>Maximum size of a command output file uploaded by a runner or from the dashboard.</summary>
    public long MaxCommandOutputBytes { get; set; } = 10 * 1024 * 1024;

    /// <summary>
    /// File extensions (with leading dot) accepted as attachments. Leave unset to use
    /// <see cref="DefaultAllowedExtensions"/>; an empty list rejects every attachment.
    /// </summary>
    public string[]? AllowedExtensions { get; set; }

    public IReadOnlySet<string> EffectiveAllowedExtensions() =>
        (AllowedExtensions ?? DefaultAllowedExtensions)
        .Select(e => e.Trim().ToLowerInvariant())
        .Where(e => e.Length > 0)
        .Select(e => e.StartsWith('.') ? e : "." + e)
        .ToHashSet();

    /// <summary>Clamps values so a bad configuration cannot disable the limits or overflow the size column.</summary>
    public long EffectiveMaxFileSizeBytes => Math.Clamp(MaxFileSizeBytes, 1, MaxConfigurableFileSizeBytes);
    public long EffectiveMaxCommandOutputBytes => Math.Clamp(MaxCommandOutputBytes, 1, MaxConfigurableFileSizeBytes);
    public int EffectiveMaxFilesPerRequest => Math.Max(1, MaxFilesPerRequest);
}

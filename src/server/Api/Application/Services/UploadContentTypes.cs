using Microsoft.AspNetCore.StaticFiles;

namespace Reconmap.Api.Application.Services;

/// <summary>Derives the MIME type of an upload from its extension, ignoring what the client claims.</summary>
public static class UploadContentTypes
{
    public const string Fallback = "application/octet-stream";

    private static readonly FileExtensionContentTypeProvider Provider = new();

    public static string FromFileName(string? fileName)
    {
        var extension = Path.GetExtension(fileName ?? string.Empty);
        return extension.Length > 0 && Provider.TryGetContentType("x" + extension, out var contentType)
            ? contentType
            : Fallback;
    }
}

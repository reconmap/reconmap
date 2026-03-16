using System.Security.Cryptography;

namespace api_v2.Application.Services;

public class LocalAttachmentStorage : IAttachmentStorage
{
    private readonly AttachmentFilePath _attachmentFilePath = new();

    public async Task<Stream> GetFileStreamAsync(string fileName)
    {
        var path = _attachmentFilePath.GenerateFilePath(fileName);
        return await Task.FromResult(File.OpenRead(path));
    }

    public async Task SaveFileAsync(string fileName, Stream stream)
    {
        var path = _attachmentFilePath.GenerateFilePath(fileName);
        var dir = Path.GetDirectoryName(path);
        if (!Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir!);
        }

        await using FileStream fileStream = new(path, FileMode.Create);
        await stream.CopyToAsync(fileStream);
    }

    public async Task DeleteFileAsync(string fileName)
    {
        var path = _attachmentFilePath.GenerateFilePath(fileName);
        if (File.Exists(path))
        {
            File.Delete(path);
        }

        await Task.CompletedTask;
    }

    public async Task<string> GetFileHashAsync(string fileName)
    {
        var path = _attachmentFilePath.GenerateFilePath(fileName);
        using var md5 = MD5.Create();
        await using var stream = File.OpenRead(path);
        var hash = await md5.ComputeHashAsync(stream);
        return Convert.ToHexStringLower(hash);
    }
}

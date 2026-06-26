namespace api_v2.Application.Services;

public interface IAttachmentStorage
{
    Task<Stream> GetFileStreamAsync(string fileName);
    Task SaveFileAsync(string fileName, Stream stream);
    Task DeleteFileAsync(string fileName);
    Task<string> GetFileHashAsync(string fileName);
}

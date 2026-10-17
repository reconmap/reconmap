namespace Reconmap.Api.Application.Services;

public interface IAttachmentStorage
{
    Task<Stream> GetFileStreamAsync(string fileName);
    Task SaveFileAsync(string fileName, Stream stream);
    Task DeleteFileAsync(string fileName);
    Task<string> GetFileHashAsync(string fileName);
}

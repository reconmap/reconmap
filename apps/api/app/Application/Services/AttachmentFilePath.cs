namespace api_v2.Application.Services;

public class AttachmentFilePath
{
    public string GenerateFileName(string extension = "")
    {
        return Guid.NewGuid().ToString("N") + extension;
    }

    public string GetDirectory()
    {
        var parent = Directory.GetParent(Directory.GetCurrentDirectory())?.FullName
                     ?? throw new InvalidOperationException("Cannot resolve parent directory");

        return Path.Combine(parent, "data", "attachments");
    }

    public string GenerateFilePath(string filePath)
    {
        return Path.Combine(GetDirectory(), filePath);
    }
}

namespace api_v2.Common;

public class StorageSettings
{
    public string Type { get; set; } = "local"; // local or s3
    public S3Settings S3 { get; set; } = new();
}

public class S3Settings
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = "attachments";
    public bool UseHttp { get; set; } = true;
}

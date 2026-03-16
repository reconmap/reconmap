using Amazon.S3;
using Amazon.S3.Model;
using api_v2.Common;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

namespace api_v2.Application.Services;

public class S3AttachmentStorage : IAttachmentStorage
{
    private readonly IAmazonS3 _s3Client;
    private readonly StorageSettings _storageSettings;

    public S3AttachmentStorage(IAmazonS3 s3Client, IOptions<StorageSettings> storageSettings)
    {
        _s3Client = s3Client;
        _storageSettings = storageSettings.Value;
    }

    public async Task<Stream> GetFileStreamAsync(string fileName)
    {
        var response = await _s3Client.GetObjectAsync(new GetObjectRequest
        {
            BucketName = _storageSettings.S3.BucketName,
            Key = fileName
        });

        return response.ResponseStream;
    }

    public async Task SaveFileAsync(string fileName, Stream stream)
    {
        var putRequest = new PutObjectRequest
        {
            BucketName = _storageSettings.S3.BucketName,
            Key = fileName,
            InputStream = stream,
            AutoCloseStream = false
        };

        await _s3Client.PutObjectAsync(putRequest);
    }

    public async Task DeleteFileAsync(string fileName)
    {
        await _s3Client.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _storageSettings.S3.BucketName,
            Key = fileName
        });
    }

    public async Task<string> GetFileHashAsync(string fileName)
    {
        var response = await _s3Client.GetObjectAsync(new GetObjectRequest
        {
            BucketName = _storageSettings.S3.BucketName,
            Key = fileName
        });

        using (var md5 = MD5.Create())
        {
            var hash = await md5.ComputeHashAsync(response.ResponseStream);
            return Convert.ToHexStringLower(hash);
        }
    }
}

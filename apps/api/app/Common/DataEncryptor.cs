using System.Security.Cryptography;
using System.Text;

namespace api_v2.Common;

public sealed class DataEncryptor
{
    private const int IvSizeBytes = 12; // Recommended GCM nonce size
    private const int TagSizeBytes = 16; // 128-bit authentication tag

    public (byte[] Iv, byte[] Tag, byte[] CipherText) Encrypt(string plainText, string password)
    {
        var key = DeriveKey(password);
        var iv = RandomNumberGenerator.GetBytes(IvSizeBytes);

        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = new byte[plainBytes.Length];
        var tag = new byte[TagSizeBytes];

        using var aes = new AesGcm(key, TagSizeBytes);
        aes.Encrypt(iv, plainBytes, cipherBytes, tag);

        return (iv, tag, cipherBytes);
    }

    public string? Decrypt(byte[] cipherText, byte[] iv, string password, byte[] tag)
    {
        var key = DeriveKey(password);

        var plainBytes = new byte[cipherText.Length];

        try
        {
            using var aes = new AesGcm(key, TagSizeBytes);
            aes.Decrypt(iv, cipherText, tag, plainBytes);
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch (CryptographicException)
        {
            return null; // Authentication failed
        }
    }

    private static byte[] DeriveKey(string password)
    {
        return SHA256.HashData(Encoding.UTF8.GetBytes(password));
    }
}

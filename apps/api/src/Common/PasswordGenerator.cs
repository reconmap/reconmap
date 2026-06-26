using System.Security.Cryptography;

namespace api_v2.Common;

public class PasswordGenerator
{
    public string Generate(int length,
        string keyspace = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    {
        if (string.IsNullOrEmpty(keyspace) || keyspace.Length < 2)
            throw new ArgumentException("The keyspace argument must be at least two characters long.",
                nameof(keyspace));

        var result = new char[length];
        var max = keyspace.Length;

        using var rng = RandomNumberGenerator.Create();
        var buffer = new byte[4];

        for (var i = 0; i < length; i++)
        {
            rng.GetBytes(buffer);
            var value = BitConverter.ToUInt32(buffer, 0);
            result[i] = keyspace[(int)(value % max)];
        }

        return new string(result);
    }
}
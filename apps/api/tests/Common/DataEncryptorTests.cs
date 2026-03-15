using api_v2.Common;
using System.Text;

namespace tests.Common;

public class DataEncryptorTests
{
    private readonly DataEncryptor _encryptor = new();

    [Fact]
    public void Encrypt_ThenDecrypt_ReturnsOriginalText()
    {
        // Arrange
        var plainText = "Sensitive information";
        var password = "SecurePassword123";

        // Act
        var (iv, tag, cipherText) = _encryptor.Encrypt(plainText, password);
        var decryptedText = _encryptor.Decrypt(cipherText, iv, password, tag);

        // Assert
        Assert.Equal(plainText, decryptedText);
    }

    [Fact]
    public void Decrypt_WithWrongPassword_ReturnsNull()
    {
        // Arrange
        var plainText = "Sensitive information";
        var password = "SecurePassword123";
        var wrongPassword = "WrongPassword456";

        // Act
        var (iv, tag, cipherText) = _encryptor.Encrypt(plainText, password);
        var decryptedText = _encryptor.Decrypt(cipherText, iv, wrongPassword, tag);

        // Assert
        Assert.Null(decryptedText);
    }

    [Fact]
    public void Decrypt_WithTamperedCipherText_ReturnsNull()
    {
        // Arrange
        var plainText = "Sensitive information";
        var password = "SecurePassword123";

        // Act
        var (iv, tag, cipherText) = _encryptor.Encrypt(plainText, password);
        cipherText[0] ^= 0xFF; // Flip some bits
        var decryptedText = _encryptor.Decrypt(cipherText, iv, password, tag);

        // Assert
        Assert.Null(decryptedText);
    }

    [Fact]
    public void Decrypt_WithTamperedTag_ReturnsNull()
    {
        // Arrange
        var plainText = "Sensitive information";
        var password = "SecurePassword123";

        // Act
        var (iv, tag, cipherText) = _encryptor.Encrypt(plainText, password);
        tag[0] ^= 0xFF; // Flip some bits
        var decryptedText = _encryptor.Decrypt(cipherText, iv, password, tag);

        // Assert
        Assert.Null(decryptedText);
    }

    [Fact]
    public void Decrypt_WithTamperedIv_ReturnsNull()
    {
        // Arrange
        var plainText = "Sensitive information";
        var password = "SecurePassword123";

        // Act
        var (iv, tag, cipherText) = _encryptor.Encrypt(plainText, password);
        iv[0] ^= 0xFF; // Flip some bits
        var decryptedText = _encryptor.Decrypt(cipherText, iv, password, tag);

        // Assert
        Assert.Null(decryptedText);
    }

    [Fact]
    public void Decrypt_WithInvalidDataSize_ReturnsNull()
    {
        // Arrange
        var plainText = "Sensitive information";
        var password = "SecurePassword123";

        // Act
        var (iv, tag, cipherText) = _encryptor.Encrypt(plainText, password);
        var invalidCipherText = new byte[cipherText.Length + 1];
        var decryptedText = _encryptor.Decrypt(invalidCipherText, iv, password, tag);

        // Assert
        Assert.Null(decryptedText);
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.Services;

public class TokenStorageService : ITokenStorageService
{
    private const string StorageFileName = "tokens.dat";
    private readonly string _storagePath;
    private const string EncryptionKey = "Southville8BEdgeUI_SecretKey_2024"; // In production, use a proper key management solution

    public TokenStorageService()
    {
        // Store tokens in user's AppData folder
        var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        var appFolder = Path.Combine(appDataPath, "Southville8BEdgeUI");
        Directory.CreateDirectory(appFolder);
        _storagePath = Path.Combine(appFolder, StorageFileName);
    }

    public async Task SaveTokensAsync(string accessToken, string refreshToken, DateTime expiresAt)
    {
        try
        {
            var tokenData = new TokenData
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt
            };

            var json = JsonSerializer.Serialize(tokenData);
            var encryptedData = EncryptString(json);

            await File.WriteAllTextAsync(_storagePath, encryptedData);
        }
        catch (Exception ex)
        {
            // Log error but don't throw - token storage failure shouldn't break the app
            System.Diagnostics.Debug.WriteLine($"Failed to save tokens: {ex.Message}");
        }
    }

    public async Task<string?> GetAccessTokenAsync()
    {
        try
        {
            var tokenData = await GetTokenDataAsync();
            return tokenData?.AccessToken;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to get access token: {ex.Message}");
            return null;
        }
    }

    public async Task<string?> GetRefreshTokenAsync()
    {
        try
        {
            var tokenData = await GetTokenDataAsync();
            return tokenData?.RefreshToken;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to get refresh token: {ex.Message}");
            return null;
        }
    }

    public async Task ClearTokensAsync()
    {
        try
        {
            if (File.Exists(_storagePath))
            {
                await Task.Run(() => File.Delete(_storagePath));
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to clear tokens: {ex.Message}");
        }
    }

    public async Task<bool> IsTokenExpiredAsync()
    {
        try
        {
            var tokenData = await GetTokenDataAsync();
            if (tokenData == null) return true;

            // Add 5 minute buffer to account for clock skew
            return tokenData.ExpiresAt <= DateTime.UtcNow.AddMinutes(5);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to check token expiration: {ex.Message}");
            return true; // Assume expired if we can't check
        }
    }

    public async Task<DateTime?> GetTokenExpirationAsync()
    {
        try
        {
            var tokenData = await GetTokenDataAsync();
            return tokenData?.ExpiresAt;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to get token expiration: {ex.Message}");
            return null;
        }
    }

    private async Task<TokenData?> GetTokenDataAsync()
    {
        if (!File.Exists(_storagePath))
            return null;

        try
        {
            var encryptedData = await File.ReadAllTextAsync(_storagePath);
            if (string.IsNullOrEmpty(encryptedData))
                return null;

            var decryptedData = DecryptString(encryptedData);
            return JsonSerializer.Deserialize<TokenData>(decryptedData);
        }
        catch
        {
            return null;
        }
    }

    private static string EncryptString(string plainText)
    {
        using var aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(EncryptionKey.PadRight(32).Substring(0, 32));
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        using var msEncrypt = new MemoryStream();
        msEncrypt.Write(aes.IV, 0, aes.IV.Length);

        using var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write);
        using var swEncrypt = new StreamWriter(csEncrypt);
        swEncrypt.Write(plainText);

        return Convert.ToBase64String(msEncrypt.ToArray());
    }

    private static string DecryptString(string cipherText)
    {
        var cipherBytes = Convert.FromBase64String(cipherText);

        using var aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(EncryptionKey.PadRight(32).Substring(0, 32));

        var iv = new byte[aes.IV.Length];
        Array.Copy(cipherBytes, 0, iv, 0, iv.Length);
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor();
        using var msDecrypt = new MemoryStream(cipherBytes, iv.Length, cipherBytes.Length - iv.Length);
        using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
        using var srDecrypt = new StreamReader(csDecrypt);

        return srDecrypt.ReadToEnd();
    }

    private class TokenData
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}

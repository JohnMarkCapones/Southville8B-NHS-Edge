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
    // DPAPI binds encryption to current Windows user; avoids embedded keys

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
            var encryptedData = Protect(json);

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

            var decryptedData = Unprotect(encryptedData);
            return JsonSerializer.Deserialize<TokenData>(decryptedData);
        }
        catch
        {
            return null;
        }
    }

    private static string Protect(string plainText)
    {
        var bytes = Encoding.UTF8.GetBytes(plainText);
        var protectedBytes = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
        return Convert.ToBase64String(protectedBytes);
    }

    private static string Unprotect(string cipherText)
    {
        var cipherBytes = Convert.FromBase64String(cipherText);
        var unprotected = ProtectedData.Unprotect(cipherBytes, null, DataProtectionScope.CurrentUser);
        return Encoding.UTF8.GetString(unprotected);
    }

    private class TokenData
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool RememberMe { get; set; }
        public string? Email { get; set; }
    }

    public async Task SaveLoginPreferenceAsync(bool rememberMe, string email)
    {
        try
        {
            var existing = await GetTokenDataAsync() ?? new TokenData();
            existing.RememberMe = rememberMe;
            existing.Email = email;
            var json = JsonSerializer.Serialize(existing);
            var encrypted = Protect(json);
            await File.WriteAllTextAsync(_storagePath, encrypted);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to save login preference: {ex.Message}");
        }
    }

    public async Task<(bool rememberMe, string? email)> GetLoginPreferenceAsync()
    {
        try
        {
            var data = await GetTokenDataAsync();
            return (data?.RememberMe ?? false, data?.Email);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Failed to get login preference: {ex.Message}");
            return (false, null);
        }
    }
}

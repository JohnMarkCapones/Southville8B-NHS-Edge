using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public class AuthService : IAuthService
{
    private readonly IApiClient _apiClient;
    private readonly ITokenStorageService _tokenStorage;
    private UserDto? _currentUser;

    public AuthService(IApiClient apiClient, ITokenStorageService tokenStorage)
    {
        _apiClient = apiClient;
        _tokenStorage = tokenStorage;
    }

    public async Task<LoginResponse?> LoginAsync(string email, string password)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"=== AuthService.LoginAsync ===");
            System.Diagnostics.Debug.WriteLine($"Email: {email}");
            System.Diagnostics.Debug.WriteLine($"Password: [HIDDEN]");

            var loginRequest = new LoginRequest
            {
                Email = email,
                Password = password
            };

            System.Diagnostics.Debug.WriteLine($"Calling API endpoint: auth/login");
            var response = await _apiClient.PostAsync<LoginResponse>("auth/login", loginRequest);

            System.Diagnostics.Debug.WriteLine($"API Response: {(response != null ? "Received response" : "null")}");
            if (response != null)
            {
                System.Diagnostics.Debug.WriteLine($"Success: {response.Success}");
                System.Diagnostics.Debug.WriteLine($"User: {(response.User != null ? $"Role: {response.User.Role}" : "null")}");
                System.Diagnostics.Debug.WriteLine($"Session: {(response.Session != null ? "Present" : "null")}");
                System.Diagnostics.Debug.WriteLine($"Message: {response.Message}");
            }

            if (response?.Success == true && response.Session != null && response.User != null)
            {
                // Store tokens securely
                var expiresAt = DateTimeOffset.FromUnixTimeSeconds(response.Session.ExpiresAt).DateTime;
                await _tokenStorage.SaveTokensAsync(
                    response.Session.AccessToken,
                    response.Session.RefreshToken,
                    expiresAt
                );

                // Cache current user (convert LoginUserDto to UserDto)
                _currentUser = ConvertLoginUserToUserDto(response.User);

                System.Diagnostics.Debug.WriteLine($"Login successful for user: {response.User.Email} with role: {response.User.Role}");
                return response;
            }

            System.Diagnostics.Debug.WriteLine($"Login failed - Success: {response?.Success}, User: {response?.User != null}, Session: {response?.Session != null}");
            return response;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Login failed with exception: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"Exception type: {ex.GetType().Name}");
            System.Diagnostics.Debug.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task LogoutAsync()
    {
        try
        {
            // Clear stored tokens
            await _tokenStorage.ClearTokensAsync();
            
            // Clear cached user
            _currentUser = null;

            // Note: In a real implementation, you might want to call a logout endpoint
            // to invalidate the token on the server side
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Logout failed: {ex.Message}");
            // Don't throw - logout should always succeed locally
        }
    }

    public async Task<bool> IsAuthenticatedAsync()
    {
        try
        {
            // Check if we have a valid token
            var accessToken = await _tokenStorage.GetAccessTokenAsync();
            if (string.IsNullOrEmpty(accessToken))
                return false;

            // Check if token is expired
            var isExpired = await _tokenStorage.IsTokenExpiredAsync();
            if (isExpired)
            {
                // Try to refresh token
                var refreshed = await RefreshTokenAsync();
                return refreshed;
            }

            return true;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Authentication check failed: {ex.Message}");
            return false;
        }
    }

    public async Task<UserDto?> GetCurrentUserAsync()
    {
        try
        {
            // Return cached user if available
            if (_currentUser != null)
                return _currentUser;

            // Check if we're authenticated
            var isAuthenticated = await IsAuthenticatedAsync();
            if (!isAuthenticated)
                return null;

            // Try to get user info from token or make API call
            // For now, we'll return null and let the calling code handle it
            // In a real implementation, you might decode the JWT token or call a user endpoint
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Get current user failed: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> RefreshTokenAsync()
    {
        try
        {
            var refreshToken = await _tokenStorage.GetRefreshTokenAsync();
            if (string.IsNullOrEmpty(refreshToken))
                return false;

            // Note: This is a placeholder implementation
            // In a real implementation, you would call the refresh token endpoint
            // For now, we'll just clear the tokens and require re-login
            await _tokenStorage.ClearTokensAsync();
            _currentUser = null;
            
            return false;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Token refresh failed: {ex.Message}");
            return false;
        }
    }

    private UserDto ConvertLoginUserToUserDto(LoginUserDto loginUser)
    {
        return new UserDto
        {
            Id = loginUser.Id,
            Email = loginUser.Email,
            FullName = loginUser.Email, // Login API doesn't provide full name, use email as fallback
            Role = new RoleDto { Name = loginUser.Role }, // Convert string role to RoleDto
            Status = "Active", // Assume active for login
            CreatedAt = loginUser.CreatedAt,
            EmailConfirmedAt = loginUser.EmailConfirmedAt,
            UserMetadata = loginUser.UserMetadata
        };
    }
}

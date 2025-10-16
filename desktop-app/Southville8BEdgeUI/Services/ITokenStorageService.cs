using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.Services;

public interface ITokenStorageService
{
    Task SaveTokensAsync(string accessToken, string refreshToken, DateTime expiresAt);
    Task<string?> GetAccessTokenAsync();
    Task<string?> GetRefreshTokenAsync();
    Task ClearTokensAsync();
    Task<bool> IsTokenExpiredAsync();
    Task<DateTime?> GetTokenExpirationAsync();
}

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(string email, string password, bool rememberMe);
    Task LogoutAsync();
    Task<bool> IsAuthenticatedAsync();
    Task<UserDto?> GetCurrentUserAsync();
    Task<bool> RefreshTokenAsync();
}

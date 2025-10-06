using System.Security.Cryptography;
using System.Text.Json;
using SouthvilleEPortal.API.Shared.Security;
using SouthvilleEPortal.API.Modules.Auth.Infrastructure;

namespace SouthvilleEPortal.API.Modules.Auth.Application;

public class AuthService
{
    private readonly ISupabaseAuthClient _supabase;
    private readonly IInternalTokenService _tokenService;
    private readonly IRefreshTokenStore _refreshStore;
    private readonly ILogger<AuthService> _log;
    private readonly int _refreshSlidingDays = 7;
    private readonly int _refreshAbsoluteDays = 30;

    public AuthService(ISupabaseAuthClient supabase, IInternalTokenService tokenService, IRefreshTokenStore refreshStore, ILogger<AuthService> log)
    {
        _supabase = supabase; 
        _tokenService = tokenService;
        _refreshStore = refreshStore;
        _log = log;
    }

    public async Task<(string accessToken, DateTime accessExpires, string refreshToken, DateTime refreshExpires)> LoginAsync(string email, string password, CancellationToken ct)
    {
        var authJson = await _supabase.PasswordGrantAsync(email, password, ct);
        using var doc = JsonDocument.Parse(authJson);
        var userElem = doc.RootElement.GetProperty("user");
        var userId = userElem.GetProperty("id").GetString()!;
        var role = ExtractRole(userElem) ?? "student";
        var perms = ExtractPermissions(userElem);
        var access = _tokenService.CreateToken(userId, role, perms);
        var refreshRaw = GenerateRefreshToken();
        var refreshExp = DateTime.UtcNow.AddDays(_refreshSlidingDays);
        await _refreshStore.StoreAsync(userId, role, refreshRaw, refreshExp, ct);
        _log.LogInformation("login.success user={UserId} role={Role}", userId, role);
        return (access.Token, access.ExpiresAtUtc, refreshRaw, refreshExp);
    }

    public async Task<(string accessToken, DateTime accessExpires, string refreshToken, DateTime refreshExpires)> RefreshAsync(string oldRefreshToken, CancellationToken ct)
    {
        if (_refreshStore is PersistentRefreshTokenStore pStore)
        {
            var replayUser = await pStore.DetectReplayUserAsync(oldRefreshToken, ct);
            if (replayUser != null)
            {
                await pStore.FamilyRevokeAsync(replayUser, ct);
                _log.LogWarning("refresh.replay_family_revoked user={UserId}", replayUser);
                throw new InvalidOperationException("replay_detected");
            }
        }

        var record = await _refreshStore.GetAsync(oldRefreshToken, ct) ?? throw new InvalidOperationException("Invalid refresh token");
        if (record.ExpiresAtUtc < DateTime.UtcNow) throw new InvalidOperationException("Expired refresh token");

        var absoluteEnd = record.CreatedAtUtc.AddDays(_refreshAbsoluteDays);
        if (DateTime.UtcNow >= absoluteEnd)
        {
            await _refreshStore.RevokeAsync(oldRefreshToken, ct);
            throw new InvalidOperationException("Session expired");
        }

        string newRefresh; DateTime newExp;
        if (_refreshStore is PersistentRefreshTokenStore rotatable)
        {
            (newRefresh, newExp) = await rotatable.RotateAsync(oldRefreshToken, record.UserId, record.Role, record.CreatedAtUtc, absoluteEnd, _refreshSlidingDays, ct);
        }
        else
        {
            await _refreshStore.RevokeAsync(oldRefreshToken, ct);
            newRefresh = GenerateRefreshToken();
            var proposed = DateTime.UtcNow.AddDays(_refreshSlidingDays);
            newExp = proposed <= absoluteEnd ? proposed : absoluteEnd;
            await _refreshStore.StoreAsync(record.UserId, record.Role, newRefresh, newExp, ct);
        }

        var access = _tokenService.CreateToken(record.UserId, record.Role, null);
        _log.LogInformation("refresh.rotate user={UserId}", record.UserId);
        return (access.Token, access.ExpiresAtUtc, newRefresh, newExp);
    }

    public Task LogoutAsync(string refreshToken, CancellationToken ct) => _refreshStore.RevokeAsync(refreshToken, ct);

    public Task RevokeAllAsync(string userId, CancellationToken ct)
    {
        if (_refreshStore is PersistentRefreshTokenStore persistent)
            return persistent.RevokeAllAsync(userId, ct);
        return Task.CompletedTask;
    }

    private static string GenerateRefreshToken()
    {
        Span<byte> bytes = stackalloc byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    private static string? ExtractRole(JsonElement userElem)
    {
        if (userElem.TryGetProperty("app_metadata", out var appMeta) && appMeta.TryGetProperty("role", out var roleProp) && roleProp.ValueKind == JsonValueKind.String)
            return roleProp.GetString();
        if (userElem.TryGetProperty("user_metadata", out var userMeta) && userMeta.TryGetProperty("role", out var roleUserProp) && roleUserProp.ValueKind == JsonValueKind.String)
            return roleUserProp.GetString();
        return null;
    }

    private static IEnumerable<string>? ExtractPermissions(JsonElement userElem)
    {
        if (userElem.TryGetProperty("app_metadata", out var appMeta) && appMeta.TryGetProperty("permissions", out var perms) && perms.ValueKind == JsonValueKind.Array)
            return perms.EnumerateArray().Where(e => e.ValueKind == JsonValueKind.String).Select(e => e.GetString()!).Distinct();
        return null;
    }
}

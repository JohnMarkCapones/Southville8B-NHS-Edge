namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure;

public record RefreshTokenRecord(string UserId, string Role, DateTime CreatedAtUtc, DateTime ExpiresAtUtc);

public interface IRefreshTokenStore
{
    Task StoreAsync(string userId, string role, string refreshToken, DateTime expiresAtUtc, CancellationToken ct);
    Task<RefreshTokenRecord?> GetAsync(string refreshToken, CancellationToken ct);
    Task RevokeAsync(string refreshToken, CancellationToken ct);
}

// In-memory implementation (dev/testing only)
public class RefreshTokenStore : IRefreshTokenStore
{
    private readonly Dictionary<string, RefreshTokenRecord> _store = new();
    private readonly object _lock = new();

    public Task StoreAsync(string userId, string role, string refreshToken, DateTime expiresAtUtc, CancellationToken ct)
    {
        lock (_lock)
        {
            _store[refreshToken] = new RefreshTokenRecord(userId, role, DateTime.UtcNow, expiresAtUtc);
        }
        return Task.CompletedTask;
    }

    public Task<RefreshTokenRecord?> GetAsync(string refreshToken, CancellationToken ct)
    {
        lock (_lock)
        {
            _store.TryGetValue(refreshToken, out var value);
            return Task.FromResult(value);
        }
    }

    public Task RevokeAsync(string refreshToken, CancellationToken ct)
    {
        lock (_lock)
        {
            _store.Remove(refreshToken);
        }
        return Task.CompletedTask;
    }
}

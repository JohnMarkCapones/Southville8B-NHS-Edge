using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure;

public class RefreshTokenCleanupService : BackgroundService
{
    private readonly ILogger<RefreshTokenCleanupService> _logger;
    private readonly IServiceProvider _provider;
    private readonly TimeSpan _interval;

    public RefreshTokenCleanupService(ILogger<RefreshTokenCleanupService> logger, IServiceProvider provider, IConfiguration config)
    {
        _logger = logger;
        _provider = provider;
        var hours = config.GetValue<int?>("REFRESH_TOKEN_CLEANUP_HOURS") ?? 6; // default every 6h
        _interval = TimeSpan.FromHours(hours < 1 ? 1 : hours);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("RefreshToken cleanup service starting (interval {Interval})", _interval);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _provider.CreateScope();
                var store = scope.ServiceProvider.GetService<IRefreshTokenStore>() as PersistentRefreshTokenStore;
                if (store != null)
                {
                    var removed = await store.CleanupExpiredAsync(stoppingToken);
                    if (removed > 0)
                        _logger.LogInformation("RefreshToken cleanup removed {Count} expired/revoked tokens", removed);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RefreshToken cleanup cycle failed");
            }
            await Task.Delay(_interval, stoppingToken);
        }
    }
}

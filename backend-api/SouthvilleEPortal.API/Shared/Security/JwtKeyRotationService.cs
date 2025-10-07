using Microsoft.Extensions.Hosting;

namespace SouthvilleEPortal.API.Shared.Security;

public class JwtKeyRotationService : BackgroundService
{
    private readonly IJwtKeyRing _keyRing;
    private readonly ILogger<JwtKeyRotationService> _log;
    private readonly TimeSpan _interval;

    public JwtKeyRotationService(IJwtKeyRing keyRing, IConfiguration config, ILogger<JwtKeyRotationService> log)
    {
        _keyRing = keyRing;
        _log = log;
        var hours = config.GetValue<int?>("JWT_ROTATION_HOURS") ?? 720; // default 30 days
        _interval = TimeSpan.FromHours(hours);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(_interval, stoppingToken);
                await _keyRing.RotateAsync(stoppingToken);
                _log.LogInformation("jwt.rotation.success kid={Kid}", _keyRing.CurrentKid);
            }
            catch (TaskCanceledException) { }
            catch (Exception ex)
            {
                _log.LogError(ex, "jwt.rotation.failed {Message}", ex.Message);
            }
        }
    }
}

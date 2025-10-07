using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SouthvilleEPortal.API.Modules.Auth.Application;
using Microsoft.Extensions.Logging;

namespace SouthvilleEPortal.API.Modules.Auth.API;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")] 
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _log;

    public AuthController(AuthService authService, ILogger<AuthController> log)
    {
        _authService = authService;
        _log = log;
    }

    [AllowAnonymous]
    [HttpPost("login")] 
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var (access, accessExp, refresh, refreshExp) = await _authService.LoginAsync(request.Email, request.Password, ct);
        return Ok(new LoginResponse(access, accessExp, refresh, refreshExp));
    }

    [AllowAnonymous]
    [HttpPost("refresh")] 
    [ProducesResponseType(typeof(RefreshRotateResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request, CancellationToken ct)
    {
        var (access, accessExp, refresh, refreshExp) = await _authService.RefreshAsync(request.RefreshToken, ct);
        return Ok(new RefreshRotateResponse(access, accessExp, refresh, refreshExp));
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request, CancellationToken ct)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        _log.LogInformation("logout.begin lookup_sample={LookupSample}", request.RefreshToken.Length >= 8 ? request.RefreshToken[..8] : "short");
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(15)); // defensive timeout
        try
        {
            await _authService.LogoutAsync(request.RefreshToken, cts.Token);
            sw.Stop();
            _log.LogInformation("logout.end elapsedMs={Elapsed}", sw.ElapsedMilliseconds);
            return NoContent();
        }
        catch (OperationCanceledException) when (cts.IsCancellationRequested && !ct.IsCancellationRequested)
        {
            sw.Stop();
            _log.LogWarning("logout.timeout elapsedMs={Elapsed}", sw.ElapsedMilliseconds);
            return StatusCode(StatusCodes.Status504GatewayTimeout, new { error = "logout_timeout" });
        }
    }

    [HttpPost("revoke-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RevokeAll(CancellationToken ct)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        await _authService.RevokeAllAsync(userId, ct);
        return NoContent();
    }

    public record LoginRequest(string Email, string Password);
    public record LoginResponse(string AccessToken, DateTime AccessTokenExpiresAtUtc, string RefreshToken, DateTime RefreshTokenExpiresAtUtc);
    public record RefreshRequest(string RefreshToken);
    public record RefreshRotateResponse(string AccessToken, DateTime AccessTokenExpiresAtUtc, string RefreshToken, DateTime RefreshTokenExpiresAtUtc);
}

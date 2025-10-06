using System.Security.Cryptography;
using System.Text;
using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SouthvilleEPortal.API.Modules.Auth.Infrastructure.Entities;
using SouthvilleEPortal.API.Shared.Infrastructure;
using BCryptNet = BCrypt.Net.BCrypt;
using Npgsql;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure;

public class PersistentRefreshTokenStore : IRefreshTokenStore
{
    private readonly ApplicationDbContext _db;
    private readonly string _pepperV1;
    private readonly string _pepperV2;
    private readonly int _workFactor;
    private readonly ILogger<PersistentRefreshTokenStore> _log;

    public ApplicationDbContext DbContext => _db;

    public PersistentRefreshTokenStore(ApplicationDbContext db, IConfiguration config, ILogger<PersistentRefreshTokenStore> log)
    {
        _db = db;
        _log = log;
        _pepperV1 = config["TokenPeppers:V1"] ?? config["TOKEN_PEPPER:V1"]
            ?? throw new InvalidOperationException("Missing TokenPeppers:V1 / TOKEN_PEPPER:V1");
        _pepperV2 = config["TokenPeppers:V2"] ?? config["TOKEN_PEPPER:V2"]
            ?? throw new InvalidOperationException("Missing TokenPeppers:V2 / TOKEN_PEPPER:V2");
        _workFactor = config.GetValue<int?>("BCRYPT_WORK_FACTOR") is int wf and >= 10 and <= 16 ? wf : 10;
    }

    private static string RandomSalt(int bytes = 12) => Convert.ToHexString(RandomNumberGenerator.GetBytes(bytes));
    private static string Sha256Hex(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }
    private string HashLookup(string rawToken, string pepper) => Sha256Hex(rawToken + pepper);
    private string HashFullBcrypt(string rawToken, string salt, string pepper) =>
        BCryptNet.HashPassword(rawToken + salt + pepper, _workFactor);
    private bool VerifyBcrypt(string rawToken, string salt, string pepper, string storedHash) =>
        BCryptNet.Verify(rawToken + salt + pepper, storedHash);

    // Helper for external rotation logic (AuthService) – deterministic lookup for either pepper
    public string ComputeLookupForExisting(string rawToken) => HashLookup(rawToken, _pepperV2);

    public async Task StoreAsync(string userId, string role, string refreshToken, DateTime expiresAtUtc, CancellationToken ct)
    {
        var salt = RandomSalt();
        var pepper = _pepperV2;
        var hashSw = Stopwatch.StartNew();
        var lookup = HashLookup(refreshToken, pepper);
        var bcrypt = HashFullBcrypt(refreshToken, salt, pepper);
        hashSw.Stop();

        var entity = new RefreshToken
        {
            UserId = userId,
            RoleSnapshot = role,
            Salt = salt,
            PepperVersion = "V2",
            LookupHash = lookup,
            TokenHash = bcrypt,
            ExpiresAtUtc = expiresAtUtc
        };
        _db.RefreshTokens.Add(entity);

        const int maxAttempts = 3;
        var sw = Stopwatch.StartNew();

        _log.LogInformation("refresh_token.store_begin user={UserId} lookupHashPrefix={LookupPrefix} expires={ExpUtc:o} hashMs={HashMs}", 
            userId, entity.LookupHash[..8], expiresAtUtc, hashSw.ElapsedMilliseconds);

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                _log.LogInformation("refresh_token.store_before_save attempt={Attempt} user={UserId}", attempt, userId);
                var saveSw = Stopwatch.StartNew();
                
                // Add timeout to prevent indefinite hangs on slow Supabase connections
                using var saveCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                saveCts.CancelAfter(TimeSpan.FromSeconds(10)); // 10s timeout for DB write
                
                await _db.SaveChangesAsync(saveCts.Token);
                saveSw.Stop();
                _log.LogInformation("refresh_token.store_after_save attempt={Attempt} user={UserId} saveMs={SaveMs}", 
                    attempt, userId, saveSw.ElapsedMilliseconds);

                if (attempt > 1)
                {
                    _log.LogInformation("refresh_token.store_retry_succeeded attempts={Attempts} user={UserId} elapsedMs={Elapsed}",
                        attempt, userId, sw.ElapsedMilliseconds);
                }
                else
                {
                    _log.LogInformation("refresh_token.store_success user={UserId} elapsedMs={Elapsed}", userId, sw.ElapsedMilliseconds);
                }
                return;
            }
            catch (DbUpdateException ex) when (IsIdempotentDuplicate(ex))
            {
                _log.LogWarning("refresh_token.duplicate_swallowed constraint={Constraint} user={UserId} attempts={Attempts} elapsedMs={Elapsed}",
                    GetConstraint(ex) ?? "unknown", userId, attempt, sw.ElapsedMilliseconds);
                return;
            }
            catch (DbUpdateException ex) when (IsTransientTimeout(ex) && attempt < maxAttempts && !ct.IsCancellationRequested)
            {
                var delay = ComputeBackoff(attempt);
                _log.LogWarning(ex,
                    "refresh_token.store_timeout_retry attempt={Attempt} delayMs={Delay} user={UserId} sqlState={SqlState} elapsedMs={Elapsed}",
                    attempt, delay.TotalMilliseconds, userId, TrySqlState(ex), sw.ElapsedMilliseconds);
                await SafeDelay(delay, ct);
                continue;
            }
            catch (OperationCanceledException oce) when (IsServerSideQueryCanceled(oce, ct) && attempt < maxAttempts)
            {
                var delay = ComputeBackoff(attempt);
                _log.LogWarning(oce,
                    "refresh_token.store_query_canceled_retry attempt={Attempt} delayMs={Delay} user={UserId} elapsedMs={Elapsed}",
                    attempt, delay.TotalMilliseconds, userId, sw.ElapsedMilliseconds);
                await SafeDelay(delay, ct);
                continue;
            }
            catch (OperationCanceledException oce) when (ct.IsCancellationRequested)
            {
                _log.LogDebug(oce, "refresh_token.store_aborted_by_caller user={UserId} elapsedMs={Elapsed}",
                    userId, sw.ElapsedMilliseconds);
                throw;
            }
            catch (OperationCanceledException oce) when (IsServerSideQueryCanceled(oce, ct) && attempt == maxAttempts)
            {
                _log.LogError(oce,
                    "refresh_token.store_query_canceled_final user={UserId} attempts={Attempts} elapsedMs={Elapsed}",
                    userId, attempt, sw.ElapsedMilliseconds);
                throw;
            }
        }
    }

    private static bool IsServerSideQueryCanceled(OperationCanceledException ex, CancellationToken ct)
    {
        if (ct.IsCancellationRequested) return false;
        return ex.Message.Contains("Query was cancelled", StringComparison.OrdinalIgnoreCase);
    }

    private static TimeSpan ComputeBackoff(int attempt)
    {
        var baseMs = 150 * attempt * attempt;
        var jitter = Random.Shared.Next(25, 75);
        return TimeSpan.FromMilliseconds(baseMs + jitter);
    }

    private static async Task SafeDelay(TimeSpan delay, CancellationToken ct)
    {
        try
        {
            await Task.Delay(delay, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
    }

    private static bool IsTransientTimeout(DbUpdateException ex)
    {
        if (ex.InnerException is PostgresException pg && pg.SqlState == PostgresErrorCodes.QueryCanceled)
            return true;
        if (ex.InnerException?.InnerException is TimeoutException)
            return true;
        return false;
    }

    private static string? TrySqlState(DbUpdateException ex)
        => (ex.InnerException as PostgresException)?.SqlState;

    private static string? GetConstraint(DbUpdateException ex) => (ex.InnerException as PostgresException)?.ConstraintName;

    private static bool IsIdempotentDuplicate(DbUpdateException ex)
    {
        if (ex.InnerException is PostgresException pg && pg.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return string.Equals(pg.ConstraintName, "PK_auth_refresh_tokens", StringComparison.OrdinalIgnoreCase)
                || string.Equals(pg.ConstraintName, "IX_auth_refresh_tokens_LookupHash", StringComparison.OrdinalIgnoreCase);
        }
        return false;
    }

    public async Task<RefreshTokenRecord?> GetAsync(string refreshToken, CancellationToken ct)
    {
        var lookupV2 = HashLookup(refreshToken, _pepperV2);
        var token = await _db.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(r => r.LookupHash == lookupV2 && r.RevokedAtUtc == null, ct);

        if (token != null && token.PepperVersion == "V2")
        {
            if (VerifyBcrypt(refreshToken, token.Salt, _pepperV2, token.TokenHash) && token.ExpiresAtUtc >= DateTime.UtcNow)
            {
                return new RefreshTokenRecord(token.UserId, token.RoleSnapshot, token.CreatedAtUtc, token.ExpiresAtUtc);
            }
            return null;
        }

        var lookupV1 = HashLookup(refreshToken, _pepperV1);
        token = await _db.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(r => r.LookupHash == lookupV1 && r.RevokedAtUtc == null, ct);
        if (token == null) return null;
        var pepper = token.PepperVersion == "V1" ? _pepperV1 : _pepperV2;
        if (!VerifyBcrypt(refreshToken, token.Salt, pepper, token.TokenHash)) return null;
        if (token.ExpiresAtUtc < DateTime.UtcNow) return null;
        return new RefreshTokenRecord(token.UserId, token.RoleSnapshot, token.CreatedAtUtc, token.ExpiresAtUtc);
    }

    public async Task<string?> DetectReplayUserAsync(string rawRefreshToken, CancellationToken ct)
    {
        foreach (var pepper in new[] { _pepperV2, _pepperV1 })
        {
            var lookup = HashLookup(rawRefreshToken, pepper);
            var entity = await _db.RefreshTokens.AsNoTracking()
                .FirstOrDefaultAsync(r => r.LookupHash == lookup && r.RevokedAtUtc != null && r.ReplacedByTokenId != null, ct);
            if (entity != null) return entity.UserId;
        }
        return null;
    }

    public async Task FamilyRevokeAsync(string userId, CancellationToken ct)
    {
        var active = await _db.RefreshTokens.Where(r => r.UserId == userId && r.RevokedAtUtc == null).ToListAsync(ct);
        if (active.Count == 0) return;
        var now = DateTime.UtcNow;
        foreach (var t in active) t.RevokedAtUtc = now;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<(string newToken, DateTime newExpiry)> RotateAsync(
        string oldRefreshToken,
        string userId,
        string role,
        DateTime createdAtUtc,
        DateTime absoluteEnd,
        int slidingDays,
        CancellationToken ct)
    {
        var lookupV2 = HashLookup(oldRefreshToken, _pepperV2);
        var oldEntity = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.LookupHash == lookupV2, ct);
        if (oldEntity == null)
        {
            var lookupV1 = HashLookup(oldRefreshToken, _pepperV1);
            oldEntity = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.LookupHash == lookupV1, ct);
        }
        if (oldEntity == null || oldEntity.RevokedAtUtc != null) throw new InvalidOperationException("cannot_rotate");

        var newRaw = GenerateRawToken();
        var salt = RandomSalt();
        var pepper = _pepperV2;
        var proposed = DateTime.UtcNow.AddDays(slidingDays);
        var newExpiry = proposed <= absoluteEnd ? proposed : absoluteEnd;

        var newId = Guid.NewGuid();
        var newEntity = new RefreshToken
        {
            Id = newId,
            UserId = userId,
            RoleSnapshot = role,
            Salt = salt,
            PepperVersion = "V2",
            LookupHash = HashLookup(newRaw, pepper),
            TokenHash = HashFullBcrypt(newRaw, salt, pepper),
            ExpiresAtUtc = newExpiry
        };
        oldEntity.RevokedAtUtc = DateTime.UtcNow;
        oldEntity.ReplacedByTokenId = newId.ToString();

        _db.RefreshTokens.Add(newEntity);
        await _db.SaveChangesAsync(ct);
        return (newRaw, newExpiry);
    }

    private static string GenerateRawToken()
    {
        Span<byte> bytes = stackalloc byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken ct)
    {
        var swTotal = Stopwatch.StartNew();
        var lookupV2 = HashLookup(refreshToken, _pepperV2);
        var now = DateTime.UtcNow;
        try
        {
            // Try V2 direct update first (fast, no entity tracking)
            var affectedV2 = await _db.RefreshTokens
                .Where(r => r.LookupHash == lookupV2 && r.RevokedAtUtc == null)
#if NET9_0_OR_GREATER
                .ExecuteUpdateAsync(u => u.SetProperty(r => r.RevokedAtUtc, _ => now), ct);
#else
                .ExecuteSqlRawAsync(
                    "UPDATE auth_refresh_tokens SET \"RevokedAtUtc\" = NOW() WHERE \"LookupHash\" = {0} AND \"RevokedAtUtc\" IS NULL",
                    lookupV2, ct);
#endif
            if (affectedV2 > 0)
            {
                _log.LogInformation("refresh_token.revoke success pepper=V2 affected={Affected} ms={Ms}", affectedV2, swTotal.ElapsedMilliseconds);
                return;
            }

            // Fallback to V1
            var lookupV1 = HashLookup(refreshToken, _pepperV1);
            var affectedV1 = await _db.RefreshTokens
                .Where(r => r.LookupHash == lookupV1 && r.RevokedAtUtc == null)
#if NET9_0_OR_GREATER
                .ExecuteUpdateAsync(u => u.SetProperty(r => r.RevokedAtUtc, _ => now), ct);
#else
                .ExecuteSqlRawAsync(
                    "UPDATE auth_refresh_tokens SET \"RevokedAtUtc\" = NOW() WHERE \"LookupHash\" = {0} AND \"RevokedAtUtc\" IS NULL",
                    lookupV1, ct);
#endif
            if (affectedV1 > 0)
            {
                _log.LogInformation("refresh_token.revoke success pepper=V1 affected={Affected} ms={Ms}", affectedV1, swTotal.ElapsedMilliseconds);
                return;
            }

            _log.LogInformation("refresh_token.revoke_noop ms={Ms}", swTotal.ElapsedMilliseconds);
        }
        catch (OperationCanceledException oce) when (!ct.IsCancellationRequested)
        {
            _log.LogWarning(oce, "refresh_token.revoke_server_side_canceled ms={Ms}", swTotal.ElapsedMilliseconds);
            throw;
        }
        catch (DbUpdateException ex)
        {
            _log.LogError(ex, "refresh_token.revoke_db_error ms={Ms}", swTotal.ElapsedMilliseconds);
            throw;
        }
        finally
        {
            swTotal.Stop();
        }
    }

    public async Task RevokeAllAsync(string userId, CancellationToken ct)
    {
        var tokens = await _db.RefreshTokens
            .Where(r => r.UserId == userId && r.RevokedAtUtc == null)
            .ToListAsync(ct);
        if (tokens.Count == 0) return;
        var now = DateTime.UtcNow;
        foreach (var t in tokens) t.RevokedAtUtc = now;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> CleanupExpiredAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var expired = await _db.RefreshTokens
            .Where(r => r.RevokedAtUtc != null || r.ExpiresAtUtc < now)
            .ToListAsync(ct);
        if (expired.Count == 0) return 0;
        _db.RefreshTokens.RemoveRange(expired);
        return await _db.SaveChangesAsync(ct);
    }
}

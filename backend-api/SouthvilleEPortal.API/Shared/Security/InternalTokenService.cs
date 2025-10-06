using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

namespace SouthvilleEPortal.API.Shared.Security;

public interface IInternalTokenService
{
    (string Token, DateTime ExpiresAtUtc, string Jti) CreateToken(string userId, string role, IEnumerable<string>? permissions = null, int? minutes = null);
}

public interface IJwtKeyRing
{
    RsaSecurityKey GetCurrentKey();
    IEnumerable<RsaSecurityKey> GetAllKeys();
    string CurrentKid { get; }
    Task RotateAsync(CancellationToken ct);
}

public class FileSystemJwtKeyRing : IJwtKeyRing
{
    private readonly string _folder;
    private readonly object _lock = new();
    private List<RsaSecurityKey> _keys = new();
    public string CurrentKid { get; private set; } = string.Empty;
    private readonly int _maxKeys = 2; // keep current + previous

    public FileSystemJwtKeyRing(IConfiguration config)
    {
        _folder = config["JWT_KEY_FOLDER"] ?? Path.Combine(AppContext.BaseDirectory, "keys");
        Directory.CreateDirectory(_folder);
        LoadKeys();
        if (_keys.Count == 0)
        {
            _keys.Add(GenerateKey(out var kid));
            CurrentKid = kid;
            PersistKey(_keys[0]);
        }
        else
        {
            CurrentKid = _keys.OrderByDescending(k => k.KeyId).First().KeyId!;
        }
    }

    private void LoadKeys()
    {
        foreach (var file in Directory.GetFiles(_folder, "*.pem"))
        {
            try
            {
                var pem = File.ReadAllText(file);
                using var rsa = RSA.Create();
                rsa.ImportFromPem(pem);
                var kid = Path.GetFileNameWithoutExtension(file);
                _keys.Add(new RsaSecurityKey(rsa.ExportParameters(true)) { KeyId = kid });
            }
            catch { /* ignore malformed */ }
        }
    }

    private void PersistKey(RsaSecurityKey key)
    {
        using var rsa = RSA.Create();
        // key.Rsa can be null when the key was created from RSAParameters ctor, so fall back to Parameters
        if (key.Rsa is not null)
            rsa.ImportParameters(key.Rsa.ExportParameters(true));
        else
            rsa.ImportParameters(key.Parameters);
        var pemPriv = ExportPrivatePem(rsa);
        File.WriteAllText(Path.Combine(_folder, key.KeyId + ".pem"), pemPriv);
    }

    private static string ExportPrivatePem(RSA rsa)
    {
        return rsa.ExportRSAPrivateKeyPem();
    }

    private static RsaSecurityKey GenerateKey(out string kid)
    {
        var rsa = RSA.Create(2048);
        kid = DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "_" + Convert.ToHexString(RandomNumberGenerator.GetBytes(4));
        return new RsaSecurityKey(rsa.ExportParameters(true)) { KeyId = kid };
    }

    public RsaSecurityKey GetCurrentKey() => _keys.First(k => k.KeyId == CurrentKid);
    public IEnumerable<RsaSecurityKey> GetAllKeys() => _keys;

    public Task RotateAsync(CancellationToken ct)
    {
        lock (_lock)
        {
            var newKey = GenerateKey(out var kid);
            _keys.Add(newKey);
            CurrentKid = kid;
            PersistKey(newKey);
            if (_keys.Count > _maxKeys)
            {
                var remove = _keys.OrderBy(k => k.KeyId).First();
                _keys.Remove(remove);
                var path = Path.Combine(_folder, remove.KeyId + ".pem");
                if (File.Exists(path)) File.Delete(path);
            }
        }
        return Task.CompletedTask;
    }
}

public class InternalTokenService : IInternalTokenService
{
    private readonly IJwtKeyRing _keyRing;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _defaultMinutes;

    public InternalTokenService(IJwtKeyRing keyRing, IConfiguration config)
    {
        _keyRing = keyRing;
        _issuer = config["JWT_INTERNAL_ISSUER"] ?? "internal-api";
        _audience = config["JWT_INTERNAL_AUDIENCE"] ?? "internal-clients";
        _defaultMinutes = int.TryParse(config["ACCESS_TOKEN_MINUTES"], out var m) ? m : 15;
    }

    public (string Token, DateTime ExpiresAtUtc, string Jti) CreateToken(string userId, string role, IEnumerable<string>? permissions = null, int? minutes = null)
    {
        var now = DateTime.UtcNow;
        var expires = now.AddMinutes(minutes ?? _defaultMinutes);
        var jti = Convert.ToHexString(RandomNumberGenerator.GetBytes(12));
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new("role", role),
            new(JwtRegisteredClaimNames.Jti, jti),
            new(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };
        if (permissions != null)
            claims.AddRange(permissions.Select(p => new Claim("perm", p)));

        var key = _keyRing.GetCurrentKey();
        var creds = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);

        var jwt = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: creds);

        var token = new JwtSecurityTokenHandler().WriteToken(jwt);
        return (token, expires, jti);
    }
}

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure.Entities;

// Persistent refresh token entity (hashed token value with per-row salt and lookup hash)
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!; // Supabase user UUID
    public string RoleSnapshot { get; set; } = null!;
    public string Salt { get; set; } = null!; // per-token random salt (hex)
    public string PepperVersion { get; set; } = "V2"; // version label (V1 legacy, V2 current)
    public string LookupHash { get; set; } = null!; // SHA256(token + pepperVersionPepper) for indexed lookup
    public string TokenHash { get; set; } = null!; // SHA256(token + salt + pepper)
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByTokenId { get; set; } // links to new token Id when rotated
    public string? CreatedIp { get; set; }
    public string? UserAgent { get; set; }
}

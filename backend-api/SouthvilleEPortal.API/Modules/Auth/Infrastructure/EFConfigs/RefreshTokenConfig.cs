using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SouthvilleEPortal.API.Modules.Auth.Infrastructure.Entities;

namespace SouthvilleEPortal.API.Modules.Auth.Infrastructure.EFConfigs;

public class RefreshTokenConfig : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("auth_refresh_tokens");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.UserId).HasMaxLength(64).IsRequired();
        builder.Property(r => r.RoleSnapshot).HasMaxLength(32).IsRequired();
        builder.Property(r => r.Salt).HasMaxLength(32).IsRequired();
        builder.Property(r => r.PepperVersion).HasMaxLength(8).HasDefaultValue("V2").IsRequired();
        builder.Property(r => r.LookupHash).HasMaxLength(128).IsRequired();
        builder.Property(r => r.TokenHash).HasMaxLength(128).IsRequired();
        builder.Property(r => r.ReplacedByTokenId).HasMaxLength(40);
        builder.Property(r => r.CreatedAtUtc).IsRequired();
        builder.Property(r => r.ExpiresAtUtc).IsRequired();
        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => r.LookupHash).IsUnique();
        builder.HasIndex(r => r.ReplacedByTokenId);
    }
}

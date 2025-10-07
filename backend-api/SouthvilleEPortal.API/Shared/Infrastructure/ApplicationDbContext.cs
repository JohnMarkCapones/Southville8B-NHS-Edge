using Microsoft.EntityFrameworkCore;
using SouthvilleEPortal.API.Modules.Students.Domain.Entities;
using SouthvilleEPortal.API.Shared.Domain;
using SouthvilleEPortal.API.Modules.Auth.Infrastructure.Entities;

namespace SouthvilleEPortal.API.Shared.Infrastructure;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // EF should not try to map domain event abstract base type
        modelBuilder.Ignore<DomainEvent>();
    }
}

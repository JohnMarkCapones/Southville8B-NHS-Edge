using Microsoft.EntityFrameworkCore.Storage;
using SouthvilleEPortal.API.Shared.Application;

namespace SouthvilleEPortal.API.Shared.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    public UnitOfWork(ApplicationDbContext context) => _context = context;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) => _context.SaveChangesAsync(cancellationToken);

    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default) => _context.Database.BeginTransactionAsync(cancellationToken);
}

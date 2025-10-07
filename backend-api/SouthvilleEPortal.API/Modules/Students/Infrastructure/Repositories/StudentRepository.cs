using Microsoft.EntityFrameworkCore;
using SouthvilleEPortal.API.Modules.Students.Domain.Entities;
using SouthvilleEPortal.API.Shared.Infrastructure;

namespace SouthvilleEPortal.API.Modules.Students.Infrastructure.Repositories;

public class StudentRepository : IStudentRepository
{
    private readonly ApplicationDbContext _context;
    public StudentRepository(ApplicationDbContext context) => _context = context;

    public async Task AddAsync(Student student, CancellationToken cancellationToken = default)
    {
        await _context.Students.AddAsync(student, cancellationToken);
    }

    public Task<Student?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Students.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    public Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default)
        => _context.Students.AsNoTracking().ToListAsync(cancellationToken);

    public Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default)
        => _context.Students.AnyAsync(s => s.Email == email && (excludeId == null || s.Id != excludeId), cancellationToken);

    public void Remove(Student student) => _context.Students.Remove(student);
}

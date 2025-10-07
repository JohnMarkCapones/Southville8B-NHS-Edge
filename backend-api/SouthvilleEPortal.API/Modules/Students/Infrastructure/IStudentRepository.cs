using SouthvilleEPortal.API.Modules.Students.Domain.Entities;

namespace SouthvilleEPortal.API.Modules.Students.Infrastructure;

public interface IStudentRepository
{
    Task AddAsync(Student student, CancellationToken cancellationToken = default);
    Task<Student?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Student>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default);
    void Remove(Student student);
    // EF change tracking handles updates once entity is modified in domain layer.
}

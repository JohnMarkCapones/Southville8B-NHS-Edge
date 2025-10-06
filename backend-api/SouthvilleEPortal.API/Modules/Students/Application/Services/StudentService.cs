using SouthvilleEPortal.API.Modules.Students.Domain.Entities;
using SouthvilleEPortal.API.Modules.Students.Domain.Exceptions;
using SouthvilleEPortal.API.Shared.Application;
using SouthvilleEPortal.API.Modules.Students.Infrastructure; // Added for IStudentRepository

namespace SouthvilleEPortal.API.Modules.Students.Application.Services;

public class StudentService
{
    private readonly IStudentRepository _repository;
    private readonly IUnitOfWork _uow;

    public StudentService(IStudentRepository repository, IUnitOfWork uow)
    {
        _repository = repository;
        _uow = uow;
    }

    public async Task<Guid> RegisterAsync(string firstName, string lastName, string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        if (await _repository.EmailExistsAsync(normalizedEmail, null, cancellationToken))
            throw new InvalidOperationException("Email already in use");

        var student = Student.Create(firstName, lastName, normalizedEmail);
        await _repository.AddAsync(student, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);
        return student.Id;
    }

    public async Task<IReadOnlyCollection<Student>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var all = await _repository.GetAllAsync(cancellationToken);
        return all;
    }

    public async Task<Student> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var student = await _repository.GetByIdAsync(id, cancellationToken);
        return student ?? throw new StudentNotFoundException(id);
    }

    public async Task UpdateAsync(Guid id, string firstName, string lastName, string? email, CancellationToken cancellationToken = default)
    {
        var student = await _repository.GetByIdAsync(id, cancellationToken) ?? throw new StudentNotFoundException(id);
        student.UpdateName(firstName, lastName);
        if (!string.IsNullOrWhiteSpace(email))
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            if (await _repository.EmailExistsAsync(normalizedEmail, id, cancellationToken))
                throw new InvalidOperationException("Email already in use");
            student.UpdateEmail(normalizedEmail);
        }
        await _uow.SaveChangesAsync(cancellationToken);
    }


    // Create soft delete if needed in future
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var student = await _repository.GetByIdAsync(id, cancellationToken) ?? throw new StudentNotFoundException(id);
        _repository.Remove(student);
        await _uow.SaveChangesAsync(cancellationToken);
    }
}

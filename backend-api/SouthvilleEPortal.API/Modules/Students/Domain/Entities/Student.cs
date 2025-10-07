using SouthvilleEPortal.API.Shared.Domain;
using SouthvilleEPortal.API.Modules.Students.Domain.ValueObjects;
using SouthvilleEPortal.API.Modules.Students.Domain.Events;

namespace SouthvilleEPortal.API.Modules.Students.Domain.Entities;

public class Student : BaseEntity
{
    public StudentName Name { get; private set; }
    public string Email { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    private Student()
    {
        // For EF Core materialization
        Name = null!; // set by EF
        Email = string.Empty; // will be populated
        CreatedAtUtc = DateTime.UtcNow;
    }

    private Student(StudentName name, string email)
    {
        Name = name;
        Email = email;
        CreatedAtUtc = DateTime.UtcNow;
        AddDomainEvent(new StudentRegistered(Guid.NewGuid(), DateTime.UtcNow, Id));
    }

    public static Student Create(string firstName, string lastName, string email)
    {
        // Basic validation (defer advanced to validator layer)
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email required");
        var name = new StudentName(firstName, lastName);
        return new Student(name, email.Trim().ToLowerInvariant());
    }

    public void UpdateName(string firstName, string lastName)
    {
        Name = new StudentName(firstName, lastName);
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email required");
        Email = email.Trim().ToLowerInvariant();
        UpdatedAtUtc = DateTime.UtcNow;
    }
}

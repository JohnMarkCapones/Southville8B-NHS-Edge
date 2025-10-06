using SouthvilleEPortal.API.Shared.Domain;

namespace SouthvilleEPortal.API.Modules.Students.Domain.ValueObjects;

public class StudentName : ValueObject
{
    public string FirstName { get; }
    public string LastName { get; }

    public StudentName(string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("First name required");
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("Last name required");
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return FirstName;
        yield return LastName;
    }
}

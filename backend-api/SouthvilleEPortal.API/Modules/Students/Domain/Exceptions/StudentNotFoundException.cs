namespace SouthvilleEPortal.API.Modules.Students.Domain.Exceptions;

public class StudentNotFoundException : Exception
{
    public StudentNotFoundException(Guid id) : base($"Student {id} not found") {}
}

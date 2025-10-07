namespace SouthvilleEPortal.API.Modules.Students.API.DTOs.Responses;

public record StudentResponse(Guid Id, string FirstName, string LastName, string Email, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);

using FluentValidation;

namespace SouthvilleEPortal.API.Modules.Students.Application.Validators;

public class RegisterStudentValidator : AbstractValidator<RegisterStudentRequest>
{
    public RegisterStudentValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320);
    }
}

public record RegisterStudentRequest(string FirstName, string LastName, string Email);

using FluentValidation;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Validators;

public sealed class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestDtoValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}

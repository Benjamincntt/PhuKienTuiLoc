using FluentValidation;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Validators;

public sealed class CreateCouponDtoValidator : AbstractValidator<CreateCouponDto>
{
    public CreateCouponDtoValidator() => CouponDtoRules.Apply(this);
}

public sealed class UpdateCouponDtoValidator : AbstractValidator<UpdateCouponDto>
{
    public UpdateCouponDtoValidator() => CouponDtoRules.Apply(this);
}

internal static class CouponDtoRules
{
    public static void Apply<T>(AbstractValidator<T> validator,
        System.Linq.Expressions.Expression<Func<T, string>> title,
        System.Linq.Expressions.Expression<Func<T, string>> code,
        System.Linq.Expressions.Expression<Func<T, string>> description)
    {
        validator.RuleFor(title).NotEmpty().MaximumLength(200);
        validator.RuleFor(code).NotEmpty().MaximumLength(50);
        validator.RuleFor(description).NotEmpty().MaximumLength(500);
    }

    public static void Apply(AbstractValidator<CreateCouponDto> validator) =>
        Apply(validator, x => x.Title, x => x.Code, x => x.Description);

    public static void Apply(AbstractValidator<UpdateCouponDto> validator) =>
        Apply(validator, x => x.Title, x => x.Code, x => x.Description);
}

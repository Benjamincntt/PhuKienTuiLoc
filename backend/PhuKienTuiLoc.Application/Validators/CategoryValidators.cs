using FluentValidation;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Validators;

public sealed class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator() => CategoryDtoRules.Apply(this);
}

public sealed class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
{
    public UpdateCategoryDtoValidator() => CategoryDtoRules.Apply(this);
}

internal static class CategoryDtoRules
{
    public static void Apply<T>(AbstractValidator<T> validator,
        System.Linq.Expressions.Expression<Func<T, string>> name,
        System.Linq.Expressions.Expression<Func<T, string>> slug,
        System.Linq.Expressions.Expression<Func<T, string>> icon)
    {
        validator.RuleFor(name).NotEmpty().MaximumLength(200);
        validator.RuleFor(slug).NotEmpty().MaximumLength(200);
        validator.RuleFor(icon).NotEmpty().MaximumLength(20);
    }

    public static void Apply(AbstractValidator<CreateCategoryDto> validator) =>
        Apply(validator, x => x.Name, x => x.Slug, x => x.Icon);

    public static void Apply(AbstractValidator<UpdateCategoryDto> validator) =>
        Apply(validator, x => x.Name, x => x.Slug, x => x.Icon);
}

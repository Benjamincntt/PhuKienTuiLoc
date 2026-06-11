using FluentValidation;
using PhuKienTuiLoc.Application.Common;

namespace PhuKienTuiLoc.Application.Validators;

public sealed class PaginationQueryValidator : AbstractValidator<PaginationQuery>
{
    public PaginationQueryValidator() => PaginationRules.Apply(this);
}

public sealed class ProductQueryValidator : AbstractValidator<ProductQuery>
{
    public ProductQueryValidator() => PaginationRules.Apply(this);
}

public sealed class CategoryQueryValidator : AbstractValidator<CategoryQuery>
{
    public CategoryQueryValidator() => PaginationRules.Apply(this);
}

internal static class PaginationRules
{
    public static void Apply<T>(AbstractValidator<T> validator,
        System.Linq.Expressions.Expression<Func<T, int>> page,
        System.Linq.Expressions.Expression<Func<T, int>> pageSize) where T : PaginationQuery
    {
        validator.RuleFor(page).GreaterThanOrEqualTo(1);
        validator.RuleFor(pageSize).InclusiveBetween(1, 100);
    }

    public static void Apply(AbstractValidator<PaginationQuery> validator) =>
        Apply(validator, x => x.Page, x => x.PageSize);

    public static void Apply(AbstractValidator<ProductQuery> validator) =>
        Apply(validator, x => x.Page, x => x.PageSize);

    public static void Apply(AbstractValidator<CategoryQuery> validator) =>
        Apply(validator, x => x.Page, x => x.PageSize);
}

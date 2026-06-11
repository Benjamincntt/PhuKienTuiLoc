using FluentValidation;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Domain.Products;

namespace PhuKienTuiLoc.Application.Validators;

public sealed class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator(IUnitOfWork unitOfWork) => ProductDtoRules.Apply(this, unitOfWork);
}

public sealed class UpdateProductDtoValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductDtoValidator(IUnitOfWork unitOfWork) => ProductDtoRules.Apply(this, unitOfWork);
}

internal static class ProductDtoRules
{
    public static void Apply(AbstractValidator<CreateProductDto> validator, IUnitOfWork unitOfWork)
    {
        validator.RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        validator.RuleFor(x => x.Slug).NotEmpty().MaximumLength(200);
        validator.RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        validator.RuleFor(x => x.OriginalPrice).GreaterThanOrEqualTo(0).When(x => x.OriginalPrice.HasValue);
        ApplyCategoryAndImages(validator, unitOfWork, x => x.CategoryId, x => x.ImageUrls);
        validator.RuleFor(x => x.SoldCount).GreaterThanOrEqualTo(0);
    }

    public static void Apply(AbstractValidator<UpdateProductDto> validator, IUnitOfWork unitOfWork)
    {
        validator.RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        validator.RuleFor(x => x.Slug).NotEmpty().MaximumLength(200);
        validator.RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        validator.RuleFor(x => x.OriginalPrice).GreaterThanOrEqualTo(0).When(x => x.OriginalPrice.HasValue);
        ApplyCategoryAndImages(validator, unitOfWork, x => x.CategoryId, x => x.ImageUrls);
        validator.RuleFor(x => x.SoldCount).GreaterThanOrEqualTo(0);
    }

    private static void ApplyCategoryAndImages<T>(
        AbstractValidator<T> validator,
        IUnitOfWork unitOfWork,
        System.Linq.Expressions.Expression<Func<T, int>> categoryId,
        System.Linq.Expressions.Expression<Func<T, List<string>>> imageUrls)
    {
        validator.RuleFor(categoryId).GreaterThan(0);
        validator.RuleFor(categoryId)
            .MustAsync(async (id, ct) => await unitOfWork.Categories.ExistsAsync(id, ct))
            .WithMessage((_, id) => $"Category id {id} does not exist.");
        validator.RuleFor(imageUrls)
            .Must(urls => ProductImageRules.NormalizeUrls(urls).Count > 0)
            .WithMessage("At least one product image is required.");
    }
}

using FluentValidation;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Validators;

public sealed class CreateNewsArticleDtoValidator : AbstractValidator<CreateNewsArticleDto>
{
    public CreateNewsArticleDtoValidator() => NewsArticleDtoRules.ApplyCreate(this);
}

public sealed class UpdateNewsArticleDtoValidator : AbstractValidator<UpdateNewsArticleDto>
{
    public UpdateNewsArticleDtoValidator() => NewsArticleDtoRules.ApplyUpdate(this);
}

internal static class NewsArticleDtoRules
{
    public static void ApplyCreate(AbstractValidator<CreateNewsArticleDto> validator)
    {
        validator.RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        validator.RuleFor(x => x.Excerpt).NotEmpty().MaximumLength(2000);
        validator.RuleFor(x => x.ImageUrl).NotEmpty().MaximumLength(1000);
    }

    public static void ApplyUpdate(AbstractValidator<UpdateNewsArticleDto> validator)
    {
        validator.RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        validator.RuleFor(x => x.Excerpt).NotEmpty().MaximumLength(2000);
        validator.RuleFor(x => x.ImageUrl).NotEmpty().MaximumLength(1000);
    }
}

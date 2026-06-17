using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Services;
using PhuKienTuiLoc.Application.Validators;

namespace PhuKienTuiLoc.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<CreateProductDtoValidator>();

        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICouponService, CouponService>();
        services.AddScoped<INewsArticleService, NewsArticleService>();
        services.AddScoped<IOrderService, OrderService>();

        return services;
    }
}

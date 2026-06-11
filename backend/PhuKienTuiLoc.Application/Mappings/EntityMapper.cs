using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Products;

namespace PhuKienTuiLoc.Application.Mappings;

public static class EntityMapper
{
    public static CategoryDto ToDto(this Category category) =>
        new(category.Id, category.Name, category.Slug, category.Icon);

    public static ProductDto ToDto(this Product product)
    {
        var imageUrls = ProductImageRules.GetGalleryUrls(product);
        return new(
            product.Id,
            product.Name,
            product.Slug,
            product.Price,
            product.OriginalPrice,
            imageUrls.FirstOrDefault() ?? product.ImageUrl,
            imageUrls,
            product.CategoryId,
            product.Category.Name,
            product.SoldCount,
            product.IsHot,
            product.IsSale
        );
    }

    public static CouponDto ToDto(this Coupon coupon) =>
        new(coupon.Id, coupon.Title, coupon.Code, coupon.Description);

    public static NewsArticleDto ToDto(this NewsArticle article) =>
        new(article.Id, article.Title, article.Excerpt, article.ImageUrl, article.PublishedAt);
}

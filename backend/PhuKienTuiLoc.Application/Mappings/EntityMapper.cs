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
        new(coupon.Id, coupon.Title, coupon.Code, coupon.Description,
            coupon.DiscountType, coupon.DiscountValue, coupon.MinOrderAmount,
            coupon.MaxUses, coupon.UsedCount, coupon.ExpiresAt, coupon.IsActive);

    public static NewsArticleDto ToDto(this NewsArticle article) =>
        new(article.Id, article.Title, article.Excerpt, article.Content, article.ImageUrl, article.PublishedAt);

    public static OrderItemDto ToDto(this OrderItem item) =>
        new(item.Id, item.ProductId, item.ProductName, item.Price, item.Quantity, item.Price * item.Quantity);

    public static OrderDto ToDto(this Order order) =>
        new(
            order.Id,
            order.CustomerName,
            order.CustomerPhone,
            order.CustomerAddress,
            order.Note,
            order.CouponCode,
            order.DiscountAmount,
            order.TotalPrice,
            order.Status,
            order.PaymentMethod,
            order.PaymentStatus,
            order.PointsEarned,
            order.CreatedAt,
            order.Items.Select(i => i.ToDto()).ToList()
        );
}

using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;

namespace PhuKienTuiLoc.Domain.Products;

public static class ProductImageRules
{
    public static List<string> NormalizeUrls(IEnumerable<string>? urls, string? fallbackUrl = null)
    {
        var list = urls?
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Select(u => u.Trim())
            .Distinct()
            .ToList() ?? [];

        if (list.Count == 0 && !string.IsNullOrWhiteSpace(fallbackUrl))
            list.Add(fallbackUrl.Trim());

        return list;
    }

    public static void ApplyGallery(Product product, IEnumerable<string> urls)
    {
        var list = urls.ToList();
        if (list.Count == 0)
            throw new ValidationException("At least one product image is required.");

        product.ImageUrl = list[0];
        product.Images.Clear();

        for (var i = 0; i < list.Count; i++)
        {
            product.Images.Add(new ProductImage
            {
                ImageUrl = list[i],
                SortOrder = i,
            });
        }
    }

    public static List<string> GetGalleryUrls(Product product)
    {
        var urls = product.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => i.ImageUrl)
            .ToList();

        if (urls.Count == 0 && !string.IsNullOrWhiteSpace(product.ImageUrl))
            urls.Add(product.ImageUrl);

        return urls;
    }
}

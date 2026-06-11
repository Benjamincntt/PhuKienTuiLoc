namespace PhuKienTuiLoc.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int SoldCount { get; set; }
    public bool IsHot { get; set; }
    public bool IsSale { get; set; }
    public Category Category { get; set; } = null!;
    public ICollection<ProductImage> Images { get; set; } = [];
}

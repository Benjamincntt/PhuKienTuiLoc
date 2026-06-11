namespace PhuKienTuiLoc.Application.DTOs;

public record ProductDto(
    int Id,
    string Name,
    string Slug,
    decimal Price,
    decimal? OriginalPrice,
    string ImageUrl,
    IReadOnlyList<string> ImageUrls,
    int CategoryId,
    string CategoryName,
    int SoldCount,
    bool IsHot,
    bool IsSale
);

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public List<string> ImageUrls { get; set; } = [];
    public int CategoryId { get; set; }
    public int SoldCount { get; set; }
    public bool IsHot { get; set; }
    public bool IsSale { get; set; }
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public List<string> ImageUrls { get; set; } = [];
    public int CategoryId { get; set; }
    public int SoldCount { get; set; }
    public bool IsHot { get; set; }
    public bool IsSale { get; set; }
}

namespace PhuKienTuiLoc.Application.Common;

public class PaginationQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public int Skip => (Page - 1) * PageSize;
}

public class ProductQuery : PaginationQuery
{
    public int? CategoryId { get; set; }
    public bool? IsHot { get; set; }
    public bool? IsSale { get; set; }
    public string? Search { get; set; }
}

public class CategoryQuery : PaginationQuery
{
    public string? Slug { get; set; }
}

public class OrderQuery : PaginationQuery
{
    public string? Status { get; set; }
    public string? Phone { get; set; }
}

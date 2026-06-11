using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface IProductRepository
{
    Task<PagedResult<Product>> GetPagedAsync(ProductQuery query, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<Product?> GetBySlugWithDetailsAsync(string slug, CancellationToken cancellationToken = default);
    Task<PagedResult<Product>> GetByCategoryIdPagedAsync(int categoryId, PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdWithImagesAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default);
    void Add(Product product);
    void Remove(Product product);
}

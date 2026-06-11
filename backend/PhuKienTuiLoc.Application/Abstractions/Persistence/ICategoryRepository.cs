using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface ICategoryRepository
{
    Task<PagedResult<Category>> GetPagedAsync(CategoryQuery query, CancellationToken cancellationToken = default);
    Task<Category?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Category?> GetByIdWithProductsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default);
    void Add(Category category);
    void Remove(Category category);
}

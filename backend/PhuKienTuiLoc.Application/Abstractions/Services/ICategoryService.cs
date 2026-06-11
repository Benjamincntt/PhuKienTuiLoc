using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface ICategoryService
{
    Task<PagedResult<CategoryDto>> GetAllAsync(CategoryQuery query, CancellationToken cancellationToken = default);
    Task<CategoryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PagedResult<ProductDto>> GetProductsAsync(int categoryId, PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default);
    Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(ProductQuery query, CancellationToken cancellationToken = default);
    Task<ProductDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

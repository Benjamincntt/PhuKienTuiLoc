using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface INewsArticleService
{
    Task<PagedResult<NewsArticleDto>> GetAllAsync(PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<NewsArticleDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<NewsArticleDto> CreateAsync(CreateNewsArticleDto dto, CancellationToken cancellationToken = default);
    Task<NewsArticleDto> UpdateAsync(int id, UpdateNewsArticleDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

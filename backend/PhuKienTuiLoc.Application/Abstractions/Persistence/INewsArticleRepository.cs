using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface INewsArticleRepository
{
    Task<PagedResult<NewsArticle>> GetPagedAsync(PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<NewsArticle?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    void Add(NewsArticle article);
    void Remove(NewsArticle article);
}

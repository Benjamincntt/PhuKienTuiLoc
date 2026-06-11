using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Persistence.Extensions;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class NewsArticleRepository(AppDbContext db) : INewsArticleRepository
{
    public async Task<PagedResult<NewsArticle>> GetPagedAsync(PaginationQuery pagination, CancellationToken cancellationToken = default) =>
        await db.NewsArticles
            .AsNoTracking()
            .OrderByDescending(n => n.PublishedAt)
            .ToPagedResultAsync(pagination, cancellationToken);

    public Task<NewsArticle?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        db.NewsArticles.FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

    public void Add(NewsArticle article) => db.NewsArticles.Add(article);

    public void Remove(NewsArticle article) => db.NewsArticles.Remove(article);
}

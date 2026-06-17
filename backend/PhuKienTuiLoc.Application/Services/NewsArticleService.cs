using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Application.Mappings;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;

namespace PhuKienTuiLoc.Application.Services;

public class NewsArticleService(IUnitOfWork unitOfWork) : INewsArticleService
{
    public async Task<PagedResult<NewsArticleDto>> GetAllAsync(PaginationQuery pagination, CancellationToken cancellationToken = default)
    {
        var result = await unitOfWork.NewsArticles.GetPagedAsync(pagination, cancellationToken);
        return MapPaged(result, a => a.ToDto());
    }

    public async Task<NewsArticleDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var article = await unitOfWork.NewsArticles.GetByIdAsync(id, cancellationToken);
        if (article is null)
            throw new NotFoundException($"News article id {id} was not found.");

        return article.ToDto();
    }

    public async Task<NewsArticleDto> CreateAsync(CreateNewsArticleDto dto, CancellationToken cancellationToken = default)
    {
        var article = new NewsArticle
        {
            Title = dto.Title,
            Excerpt = dto.Excerpt,
            Content = dto.Content,
            ImageUrl = dto.ImageUrl,
            PublishedAt = dto.PublishedAt ?? DateTime.UtcNow,
        };

        unitOfWork.NewsArticles.Add(article);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return article.ToDto();
    }

    public async Task<NewsArticleDto> UpdateAsync(int id, UpdateNewsArticleDto dto, CancellationToken cancellationToken = default)
    {
        var article = await unitOfWork.NewsArticles.GetByIdAsync(id, cancellationToken);
        if (article is null)
            throw new NotFoundException($"News article id {id} was not found.");

        article.Title = dto.Title;
        article.Excerpt = dto.Excerpt;
        article.Content = dto.Content;
        article.ImageUrl = dto.ImageUrl;
        article.PublishedAt = dto.PublishedAt;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return article.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var article = await unitOfWork.NewsArticles.GetByIdAsync(id, cancellationToken);
        if (article is null)
            throw new NotFoundException($"News article id {id} was not found.");

        unitOfWork.NewsArticles.Remove(article);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static PagedResult<TDto> MapPaged<TEntity, TDto>(PagedResult<TEntity> source, Func<TEntity, TDto> mapper) =>
        new()
        {
            Items = source.Items.Select(mapper).ToList(),
            Page = source.Page,
            PageSize = source.PageSize,
            TotalCount = source.TotalCount,
        };
}

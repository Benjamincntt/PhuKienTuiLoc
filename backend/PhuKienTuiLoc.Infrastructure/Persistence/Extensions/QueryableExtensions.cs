using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Extensions;

public static class QueryableExtensions
{
    public static IQueryable<Product> ApplyFilters(this IQueryable<Product> query, ProductQuery filters)
    {
        if (filters.CategoryId is int categoryId)
            query = query.Where(p => p.CategoryId == categoryId);

        if (filters.IsHot is bool isHot)
            query = query.Where(p => p.IsHot == isHot);

        if (filters.IsSale is bool isSale)
            query = query.Where(p => p.IsSale == isSale);

        if (!string.IsNullOrWhiteSpace(filters.Search))
        {
            var search = filters.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(search) ||
                                     p.Slug.ToLower().Contains(search));
        }

        return query;
    }

    public static async Task<PagedResult<TEntity>> ToPagedResultAsync<TEntity>(
        this IQueryable<TEntity> query,
        PaginationQuery pagination,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip(pagination.Skip)
            .Take(pagination.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TEntity>
        {
            Items = items,
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = totalCount,
        };
    }
}

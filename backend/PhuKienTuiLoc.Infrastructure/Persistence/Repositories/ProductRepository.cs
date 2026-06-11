using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Persistence.Extensions;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class ProductRepository(AppDbContext db) : IProductRepository
{
    private IQueryable<Product> ProductsQuery() =>
        db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images);

    public async Task<PagedResult<Product>> GetPagedAsync(ProductQuery query, CancellationToken cancellationToken = default) =>
        await ProductsQuery()
            .ApplyFilters(query)
            .OrderBy(p => p.Id)
            .ToPagedResultAsync(query, cancellationToken);

    public Task<Product?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default) =>
        ProductsQuery().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<Product?> GetBySlugWithDetailsAsync(string slug, CancellationToken cancellationToken = default) =>
        ProductsQuery().FirstOrDefaultAsync(p => p.Slug == slug, cancellationToken);

    public async Task<PagedResult<Product>> GetByCategoryIdPagedAsync(int categoryId, PaginationQuery pagination, CancellationToken cancellationToken = default) =>
        await ProductsQuery()
            .Where(p => p.CategoryId == categoryId)
            .OrderBy(p => p.Id)
            .ToPagedResultAsync(pagination, cancellationToken);

    public Task<Product?> GetByIdWithImagesAsync(int id, CancellationToken cancellationToken = default) =>
        db.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default) =>
        db.Products.AnyAsync(p => p.Slug == slug && (excludeId == null || p.Id != excludeId), cancellationToken);

    public void Add(Product product) => db.Products.Add(product);

    public void Remove(Product product) => db.Products.Remove(product);
}

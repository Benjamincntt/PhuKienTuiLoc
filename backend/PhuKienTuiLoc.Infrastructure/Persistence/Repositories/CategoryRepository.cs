using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Persistence.Extensions;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class CategoryRepository(AppDbContext db) : ICategoryRepository
{
    public async Task<PagedResult<Category>> GetPagedAsync(CategoryQuery query, CancellationToken cancellationToken = default)
    {
        var categories = db.Categories.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Slug))
            categories = categories.Where(c => c.Slug == query.Slug);

        return await categories
            .OrderBy(c => c.Id)
            .ToPagedResultAsync(query, cancellationToken);
    }

    public Task<Category?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        db.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<Category?> GetByIdWithProductsAsync(int id, CancellationToken cancellationToken = default) =>
        db.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        db.Categories.AnyAsync(c => c.Id == id, cancellationToken);

    public Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken cancellationToken = default) =>
        db.Categories.AnyAsync(c => c.Slug == slug && (excludeId == null || c.Id != excludeId), cancellationToken);

    public void Add(Category category) => db.Categories.Add(category);

    public void Remove(Category category) => db.Categories.Remove(category);
}

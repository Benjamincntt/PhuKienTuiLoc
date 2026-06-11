using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Application.Mappings;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;

namespace PhuKienTuiLoc.Application.Services;

public class CategoryService(IUnitOfWork unitOfWork) : ICategoryService
{
    public async Task<PagedResult<CategoryDto>> GetAllAsync(CategoryQuery query, CancellationToken cancellationToken = default)
    {
        var result = await unitOfWork.Categories.GetPagedAsync(query, cancellationToken);
        return MapPaged(result, c => c.ToDto());
    }

    public async Task<CategoryDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
        if (category is null)
            throw new NotFoundException($"Category id {id} was not found.");

        return category.ToDto();
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(int categoryId, PaginationQuery pagination, CancellationToken cancellationToken = default)
    {
        if (!await unitOfWork.Categories.ExistsAsync(categoryId, cancellationToken))
            throw new NotFoundException($"Category id {categoryId} was not found.");

        var result = await unitOfWork.Products.GetByCategoryIdPagedAsync(categoryId, pagination, cancellationToken);
        return MapPaged(result, p => p.ToDto());
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        if (await unitOfWork.Categories.SlugExistsAsync(dto.Slug, cancellationToken: cancellationToken))
            throw new ConflictException("Slug already exists", $"Category slug '{dto.Slug}' is already taken.");

        var category = new Category
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Icon = dto.Icon,
        };

        unitOfWork.Categories.Add(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return category.ToDto();
    }

    public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
        if (category is null)
            throw new NotFoundException($"Category id {id} was not found.");

        if (await unitOfWork.Categories.SlugExistsAsync(dto.Slug, id, cancellationToken))
            throw new ConflictException("Slug already exists", $"Category slug '{dto.Slug}' is already taken.");

        category.Name = dto.Name;
        category.Slug = dto.Slug;
        category.Icon = dto.Icon;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return category.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await unitOfWork.Categories.GetByIdWithProductsAsync(id, cancellationToken);
        if (category is null)
            throw new NotFoundException($"Category id {id} was not found.");

        if (category.Products.Count > 0)
            throw new ConflictException(
                "Category has products",
                "Cannot delete a category that still has products. Remove or reassign products first.");

        unitOfWork.Categories.Remove(category);
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

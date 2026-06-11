using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Application.Mappings;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;
using PhuKienTuiLoc.Domain.Products;

namespace PhuKienTuiLoc.Application.Services;

public class ProductService(IUnitOfWork unitOfWork) : IProductService
{
    public async Task<PagedResult<ProductDto>> GetAllAsync(ProductQuery query, CancellationToken cancellationToken = default)
    {
        var result = await unitOfWork.Products.GetPagedAsync(query, cancellationToken);
        return MapPaged(result, p => p.ToDto());
    }

    public async Task<ProductDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await unitOfWork.Products.GetByIdWithDetailsAsync(id, cancellationToken);
        if (product is null)
            throw new NotFoundException($"Product id {id} was not found.");

        return product.ToDto();
    }

    public async Task<ProductDto> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var product = await unitOfWork.Products.GetBySlugWithDetailsAsync(slug, cancellationToken);
        if (product is null)
            throw new NotFoundException($"Product slug '{slug}' was not found.");

        return product.ToDto();
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        if (await unitOfWork.Products.SlugExistsAsync(dto.Slug, cancellationToken: cancellationToken))
            throw new ConflictException("Slug already exists", $"Product slug '{dto.Slug}' is already taken.");

        var imageUrls = ProductImageRules.NormalizeUrls(dto.ImageUrls);

        var product = new Product
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            CategoryId = dto.CategoryId,
            SoldCount = dto.SoldCount,
            IsHot = dto.IsHot,
            IsSale = dto.IsSale,
        };

        ProductImageRules.ApplyGallery(product, imageUrls);

        unitOfWork.Products.Add(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await unitOfWork.Products.GetByIdWithDetailsAsync(product.Id, cancellationToken);
        return created!.ToDto();
    }

    public async Task<ProductDto> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await unitOfWork.Products.GetByIdWithImagesAsync(id, cancellationToken);
        if (product is null)
            throw new NotFoundException($"Product id {id} was not found.");

        if (await unitOfWork.Products.SlugExistsAsync(dto.Slug, id, cancellationToken))
            throw new ConflictException("Slug already exists", $"Product slug '{dto.Slug}' is already taken.");

        var imageUrls = ProductImageRules.NormalizeUrls(dto.ImageUrls);

        product.Name = dto.Name;
        product.Slug = dto.Slug;
        product.Price = dto.Price;
        product.OriginalPrice = dto.OriginalPrice;
        product.CategoryId = dto.CategoryId;
        product.SoldCount = dto.SoldCount;
        product.IsHot = dto.IsHot;
        product.IsSale = dto.IsSale;

        ProductImageRules.ApplyGallery(product, imageUrls);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await unitOfWork.Products.GetByIdWithDetailsAsync(id, cancellationToken);
        return updated!.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await unitOfWork.Products.GetByIdWithImagesAsync(id, cancellationToken);
        if (product is null)
            throw new NotFoundException($"Product id {id} was not found.");

        unitOfWork.Products.Remove(product);
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

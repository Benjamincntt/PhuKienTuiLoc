using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Application.Mappings;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;

namespace PhuKienTuiLoc.Application.Services;

public class CouponService(IUnitOfWork unitOfWork) : ICouponService
{
    public async Task<PagedResult<CouponDto>> GetAllAsync(PaginationQuery pagination, CancellationToken cancellationToken = default)
    {
        var result = await unitOfWork.Coupons.GetPagedAsync(pagination, cancellationToken);
        return MapPaged(result, c => c.ToDto());
    }

    public async Task<CouponDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var coupon = await unitOfWork.Coupons.GetByIdAsync(id, cancellationToken);
        if (coupon is null)
            throw new NotFoundException($"Coupon id {id} was not found.");

        return coupon.ToDto();
    }

    public async Task<CouponDto> CreateAsync(CreateCouponDto dto, CancellationToken cancellationToken = default)
    {
        if (await unitOfWork.Coupons.CodeExistsAsync(dto.Code, cancellationToken: cancellationToken))
            throw new ConflictException("Code already exists", $"Coupon code '{dto.Code}' is already taken.");

        var coupon = new Coupon
        {
            Title = dto.Title,
            Code = dto.Code,
            Description = dto.Description,
        };

        unitOfWork.Coupons.Add(coupon);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return coupon.ToDto();
    }

    public async Task<CouponDto> UpdateAsync(int id, UpdateCouponDto dto, CancellationToken cancellationToken = default)
    {
        var coupon = await unitOfWork.Coupons.GetByIdAsync(id, cancellationToken);
        if (coupon is null)
            throw new NotFoundException($"Coupon id {id} was not found.");

        if (await unitOfWork.Coupons.CodeExistsAsync(dto.Code, id, cancellationToken))
            throw new ConflictException("Code already exists", $"Coupon code '{dto.Code}' is already taken.");

        coupon.Title = dto.Title;
        coupon.Code = dto.Code;
        coupon.Description = dto.Description;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return coupon.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var coupon = await unitOfWork.Coupons.GetByIdAsync(id, cancellationToken);
        if (coupon is null)
            throw new NotFoundException($"Coupon id {id} was not found.");

        unitOfWork.Coupons.Remove(coupon);
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

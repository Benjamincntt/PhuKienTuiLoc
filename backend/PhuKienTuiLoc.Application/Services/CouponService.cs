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
        var coupon = await unitOfWork.Coupons.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Coupon id {id} was not found.");
        return coupon.ToDto();
    }

    public async Task<CouponDto> CreateAsync(CreateCouponDto dto, CancellationToken cancellationToken = default)
    {
        var code = dto.Code.Trim().ToUpper();
        if (await unitOfWork.Coupons.CodeExistsAsync(code, cancellationToken: cancellationToken))
            throw new ConflictException("Code already exists", $"Coupon code '{code}' is already taken.");

        var coupon = new Coupon
        {
            Title = dto.Title.Trim(),
            Code = code,
            Description = dto.Description.Trim(),
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinOrderAmount = dto.MinOrderAmount,
            MaxUses = dto.MaxUses,
            ExpiresAt = dto.ExpiresAt,
            IsActive = dto.IsActive,
            UsedCount = 0,
        };

        unitOfWork.Coupons.Add(coupon);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return coupon.ToDto();
    }

    public async Task<CouponDto> UpdateAsync(int id, UpdateCouponDto dto, CancellationToken cancellationToken = default)
    {
        var coupon = await unitOfWork.Coupons.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Coupon id {id} was not found.");

        var code = dto.Code.Trim().ToUpper();
        if (await unitOfWork.Coupons.CodeExistsAsync(code, id, cancellationToken))
            throw new ConflictException("Code already exists", $"Coupon code '{code}' is already taken.");

        coupon.Title = dto.Title.Trim();
        coupon.Code = code;
        coupon.Description = dto.Description.Trim();
        coupon.DiscountType = dto.DiscountType;
        coupon.DiscountValue = dto.DiscountValue;
        coupon.MinOrderAmount = dto.MinOrderAmount;
        coupon.MaxUses = dto.MaxUses;
        coupon.ExpiresAt = dto.ExpiresAt;
        coupon.IsActive = dto.IsActive;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return coupon.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var coupon = await unitOfWork.Coupons.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Coupon id {id} was not found.");

        unitOfWork.Coupons.Remove(coupon);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<ValidateCouponResultDto> ValidateAsync(ValidateCouponDto dto, CancellationToken cancellationToken = default)
    {
        var coupon = await unitOfWork.Coupons.GetByCodeAsync(dto.Code, cancellationToken);

        if (coupon is null)
            return Fail("Mã giảm giá không tồn tại.");

        if (!coupon.IsActive)
            return Fail("Mã giảm giá đã bị vô hiệu hóa.");

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < DateTime.UtcNow)
            return Fail("Mã giảm giá đã hết hạn.");

        if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses.Value)
            return Fail("Mã giảm giá đã hết lượt sử dụng.");

        if (dto.OrderAmount < coupon.MinOrderAmount)
            return Fail($"Đơn hàng tối thiểu {FormatVnd(coupon.MinOrderAmount)} để dùng mã này.");

        var discount = coupon.DiscountType == DiscountTypes.Percent
            ? Math.Round(dto.OrderAmount * coupon.DiscountValue / 100, 0)
            : coupon.DiscountValue;

        discount = Math.Min(discount, dto.OrderAmount);
        var final = dto.OrderAmount - discount;

        return new ValidateCouponResultDto(true, null, discount, final, coupon.ToDto());
    }

    // --- helpers ---

    public static decimal CalculateDiscount(Coupon coupon, decimal orderAmount)
    {
        var discount = coupon.DiscountType == DiscountTypes.Percent
            ? Math.Round(orderAmount * coupon.DiscountValue / 100, 0)
            : coupon.DiscountValue;
        return Math.Min(discount, orderAmount);
    }

    private static ValidateCouponResultDto Fail(string message) =>
        new(false, message, 0, 0, null);

    private static string FormatVnd(decimal amount) =>
        amount.ToString("N0") + "đ";

    private static PagedResult<TDto> MapPaged<TEntity, TDto>(PagedResult<TEntity> source, Func<TEntity, TDto> mapper) =>
        new()
        {
            Items = source.Items.Select(mapper).ToList(),
            Page = source.Page,
            PageSize = source.PageSize,
            TotalCount = source.TotalCount,
        };
}

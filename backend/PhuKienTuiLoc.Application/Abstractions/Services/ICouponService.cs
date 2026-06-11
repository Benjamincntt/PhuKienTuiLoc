using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface ICouponService
{
    Task<PagedResult<CouponDto>> GetAllAsync(PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<CouponDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CouponDto> CreateAsync(CreateCouponDto dto, CancellationToken cancellationToken = default);
    Task<CouponDto> UpdateAsync(int id, UpdateCouponDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

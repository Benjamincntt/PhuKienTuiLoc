using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface ICouponRepository
{
    Task<PagedResult<Coupon>> GetPagedAsync(PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<Coupon?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Coupon?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);
    void Add(Coupon coupon);
    void Remove(Coupon coupon);
}

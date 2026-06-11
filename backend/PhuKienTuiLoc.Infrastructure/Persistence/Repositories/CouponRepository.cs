using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Persistence.Extensions;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class CouponRepository(AppDbContext db) : ICouponRepository
{
    public async Task<PagedResult<Coupon>> GetPagedAsync(PaginationQuery pagination, CancellationToken cancellationToken = default) =>
        await db.Coupons
            .AsNoTracking()
            .OrderBy(c => c.Id)
            .ToPagedResultAsync(pagination, cancellationToken);

    public Task<Coupon?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        db.Coupons.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<bool> CodeExistsAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default) =>
        db.Coupons.AnyAsync(c => c.Code == code && (excludeId == null || c.Id != excludeId), cancellationToken);

    public void Add(Coupon coupon) => db.Coupons.Add(coupon);

    public void Remove(Coupon coupon) => db.Coupons.Remove(coupon);
}

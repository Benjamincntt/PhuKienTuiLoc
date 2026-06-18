using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Persistence.Extensions;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public async Task<PagedResult<Order>> GetPagedAsync(OrderQuery query, CancellationToken cancellationToken = default)
    {
        var q = db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status))
            q = q.Where(o => o.Status == query.Status);

        if (!string.IsNullOrWhiteSpace(query.Phone))
            q = q.Where(o => o.CustomerPhone.Contains(query.Phone));

        return await q
            .OrderByDescending(o => o.CreatedAt)
            .ToPagedResultAsync(query, cancellationToken);
    }

    public Task<Order?> GetByIdWithItemsAsync(int id, CancellationToken cancellationToken = default) =>
        db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

    public Task<Order?> GetByIdTrackedAsync(int id, CancellationToken cancellationToken = default) =>
        db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Order>> GetByCustomerAsync(int customerId, CancellationToken cancellationToken = default) =>
        await db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

    public void Add(Order order) => db.Orders.Add(order);
}

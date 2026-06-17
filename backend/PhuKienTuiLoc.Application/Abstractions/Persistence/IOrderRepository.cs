using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface IOrderRepository
{
    Task<PagedResult<Order>> GetPagedAsync(OrderQuery query, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdWithItemsAsync(int id, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdTrackedAsync(int id, CancellationToken cancellationToken = default);
    void Add(Order order);
}

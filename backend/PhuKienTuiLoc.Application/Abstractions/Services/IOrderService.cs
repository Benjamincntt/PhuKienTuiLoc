using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface IOrderService
{
    Task<PagedResult<OrderDto>> GetAllAsync(OrderQuery query, CancellationToken cancellationToken = default);
    Task<OrderDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CreateOrderResultDto> CreateAsync(CreateOrderDto dto, int? customerId = null, string? clientIp = null, CancellationToken cancellationToken = default);
    Task<OrderPublicDto?> GetPublicAsync(int id, CancellationToken cancellationToken = default);
    Task<OrderDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderDto>> GetMyOrdersAsync(int customerId, CancellationToken cancellationToken = default);
}

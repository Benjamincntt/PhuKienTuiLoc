using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface IOrderNotificationService
{
    /// <returns>true nếu đã gửi email thành công.</returns>
    Task<bool> SendNewOrderNotificationAsync(Order order, CancellationToken cancellationToken = default);
}

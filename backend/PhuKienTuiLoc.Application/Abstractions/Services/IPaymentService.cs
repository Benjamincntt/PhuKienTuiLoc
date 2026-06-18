using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface IPaymentService
{
    Task<string> CreatePaymentUrlAsync(Order order, string clientIp, CancellationToken cancellationToken = default);

    /// <summary>Xử lý return URL từ VNPay (trình duyệt). Trả về orderId và thành công/thất bại.</summary>
    Task<(int OrderId, bool Success, string Message)> ProcessVnPayReturnAsync(
        IReadOnlyDictionary<string, string> queryParams,
        CancellationToken cancellationToken = default);

    /// <summary>IPN server-to-server VNPay.</summary>
    Task<(bool Success, string ResponseCode)> ProcessVnPayIpnAsync(
        IReadOnlyDictionary<string, string> queryParams,
        CancellationToken cancellationToken = default);

    /// <summary>Xử lý redirect return từ Momo.</summary>
    Task<(int OrderId, bool Success, string Message)> ProcessMomoReturnAsync(
        IReadOnlyDictionary<string, string> queryParams,
        CancellationToken cancellationToken = default);

    /// <summary>IPN server-to-server Momo.</summary>
    Task ProcessMomoIpnAsync(
        string jsonBody,
        CancellationToken cancellationToken = default);
}

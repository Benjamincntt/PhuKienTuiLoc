using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Customer?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default);
    Task<Customer?> GetByEmailOrPhoneAsync(string identifier, CancellationToken cancellationToken = default);
    Task<Customer?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default);
    Task<bool> ExistsEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsPhoneAsync(string phone, CancellationToken cancellationToken = default);
    Task AddAsync(Customer customer, CancellationToken cancellationToken = default);
    /// <summary>Lấy customer ở trạng thái tracked để cập nhật (vd cộng điểm).</summary>
    Task<Customer?> GetTrackedAsync(int id, CancellationToken cancellationToken = default);
}

using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface ICustomerAuthService
{
    Task<CustomerAuthResponseDto> RegisterAsync(CustomerRegisterDto dto, CancellationToken cancellationToken = default);
    Task<CustomerAuthResponseDto?> LoginAsync(CustomerLoginDto dto, CancellationToken cancellationToken = default);
    Task<CustomerAuthResponseDto?> GoogleLoginAsync(GoogleLoginDto dto, CancellationToken cancellationToken = default);
    Task<CustomerProfileDto?> GetProfileAsync(int customerId, CancellationToken cancellationToken = default);
}

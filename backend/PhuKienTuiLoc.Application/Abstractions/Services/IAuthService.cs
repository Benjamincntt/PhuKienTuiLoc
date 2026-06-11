using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<AdminProfileDto?> GetProfileAsync(string username, CancellationToken cancellationToken = default);
}

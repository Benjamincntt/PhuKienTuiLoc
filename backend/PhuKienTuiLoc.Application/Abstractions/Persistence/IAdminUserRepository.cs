using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface IAdminUserRepository
{
    Task<AdminUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
}

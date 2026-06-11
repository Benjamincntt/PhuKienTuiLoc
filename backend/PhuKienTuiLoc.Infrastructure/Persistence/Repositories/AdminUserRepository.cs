using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class AdminUserRepository(AppDbContext db) : IAdminUserRepository
{
    public Task<AdminUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default) =>
        db.AdminUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
}

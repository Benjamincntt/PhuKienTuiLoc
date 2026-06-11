using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Configuration;
using PhuKienTuiLoc.Infrastructure.Persistence;

namespace PhuKienTuiLoc.Infrastructure.Seeders;

public static class AdminSeeder
{
    public static async Task SeedAsync(AppDbContext context, IOptions<AdminSeedSettings> adminOptions)
    {
        var users = adminOptions.Value.Users;
        if (users.Count == 0)
            return;

        foreach (var user in users)
        {
            if (await context.AdminUsers.AnyAsync(u => u.Username == user.Username))
                continue;

            context.AdminUsers.Add(new AdminUser
            {
                Username = user.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.Password),
                Role = user.Role,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await context.SaveChangesAsync();
    }
}

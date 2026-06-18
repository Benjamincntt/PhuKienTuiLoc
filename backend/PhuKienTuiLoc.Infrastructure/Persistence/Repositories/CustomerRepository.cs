using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Domain.Entities;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class CustomerRepository(AppDbContext db) : ICustomerRepository
{
    public Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<Customer?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Email == email, cancellationToken);

    public Task<Customer?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default) =>
        db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Phone == phone, cancellationToken);

    public Task<Customer?> GetByEmailOrPhoneAsync(string identifier, CancellationToken cancellationToken = default) =>
        identifier.Contains('@')
            ? GetByEmailAsync(identifier, cancellationToken)
            : GetByPhoneAsync(identifier, cancellationToken);

    public Task<Customer?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default) =>
        db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.GoogleId == googleId, cancellationToken);

    public Task<bool> ExistsEmailAsync(string email, CancellationToken cancellationToken = default) =>
        db.Customers.AnyAsync(c => c.Email == email, cancellationToken);

    public Task<bool> ExistsPhoneAsync(string phone, CancellationToken cancellationToken = default) =>
        db.Customers.AnyAsync(c => c.Phone == phone, cancellationToken);

    public async Task AddAsync(Customer customer, CancellationToken cancellationToken = default) =>
        await db.Customers.AddAsync(customer, cancellationToken);

    public Task<Customer?> GetTrackedAsync(int id, CancellationToken cancellationToken = default) =>
        db.Customers.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
}

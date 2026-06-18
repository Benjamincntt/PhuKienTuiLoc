using PhuKienTuiLoc.Application.Abstractions.Persistence;

namespace PhuKienTuiLoc.Infrastructure.Persistence.Repositories;

public class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    public ICategoryRepository Categories { get; } = new CategoryRepository(db);
    public IProductRepository Products { get; } = new ProductRepository(db);
    public ICouponRepository Coupons { get; } = new CouponRepository(db);
    public INewsArticleRepository NewsArticles { get; } = new NewsArticleRepository(db);
    public IAdminUserRepository AdminUsers { get; } = new AdminUserRepository(db);
    public IOrderRepository Orders { get; } = new OrderRepository(db);
    public ICustomerRepository Customers { get; } = new CustomerRepository(db);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}

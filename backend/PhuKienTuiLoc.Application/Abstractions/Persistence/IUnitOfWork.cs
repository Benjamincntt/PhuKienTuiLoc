namespace PhuKienTuiLoc.Application.Abstractions.Persistence;

public interface IUnitOfWork
{
    ICategoryRepository Categories { get; }
    IProductRepository Products { get; }
    ICouponRepository Coupons { get; }
    INewsArticleRepository NewsArticles { get; }
    IAdminUserRepository AdminUsers { get; }
    IOrderRepository Orders { get; }
    ICustomerRepository Customers { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

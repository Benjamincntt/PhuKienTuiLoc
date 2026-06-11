using Microsoft.EntityFrameworkCore;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Persistence;

namespace PhuKienTuiLoc.Infrastructure.Seeders;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Categories.AnyAsync())
            return;

        var categories = new List<Category>
        {
            new() { Name = "Túi lọc vải không dệt", Slug = "tui-loc-vai-khong-det", Icon = "🧵" },
            new() { Name = "Túi lọc trà", Slug = "tui-loc-tra", Icon = "🍵" },
            new() { Name = "Túi lọc giấy", Slug = "tui-loc-giay", Icon = "📄" },
            new() { Name = "Túi lọc sợi ngô", Slug = "tui-loc-soi-ngo", Icon = "🌽" },
            new() { Name = "Bóng lọc trà inox", Slug = "bong-loc-tra-inox", Icon = "⚙️" },
            new() { Name = "Túi OFF đựng bánh, kẹo", Slug = "tui-off-banh-keo", Icon = "🎁" },
        };

        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();

        var products = new List<Product>
        {
            new() { Name = "Combo 100 Túi lọc trà, cà phê bằng Giấy Gấp Miệng", Slug = "combo-100-tui-loc-giay-gap-mieng", Price = 25000, ImageUrl = "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop", CategoryId = 3, SoldCount = 12500, IsHot = true },
            new() { Name = "Combo 100 túi lọc trà, cafe, thảo dược vải không dệt", Slug = "combo-100-tui-loc-vai-khong-det", Price = 40000, ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop", CategoryId = 1, SoldCount = 8900, IsHot = true },
            new() { Name = "Lọc inox hình tròn cao cấp, có dây treo", Slug = "loc-inox-hinh-tron", Price = 78000, ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop", CategoryId = 5, SoldCount = 3200, IsHot = true },
            new() { Name = "(Sỉ) Combo 100 Túi lọc trà, cà phê vải không dệt", Slug = "si-combo-100-tui-loc-vai", Price = 27000, ImageUrl = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop", CategoryId = 1, SoldCount = 5600, IsHot = true },
            new() { Name = "Phin giấy pha cà phê / túi lọc cà phê du lịch", Slug = "phin-giay-pha-ca-phe", Price = 2160, ImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop", CategoryId = 3, SoldCount = 15200, IsHot = true },
            new() { Name = "Combo 100 Túi lọc trà lưới tam giác dây nhúng", Slug = "combo-100-tui-loc-tam-giac", Price = 100000, ImageUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=400&fit=crop", CategoryId = 2, SoldCount = 2100, IsHot = true },
            new() { Name = "Túi lọc vải sợi đựng gia vị nấu ăn, lọc sữa hạt", Slug = "tui-loc-vai-soi-gia-vi", Price = 7000, ImageUrl = "https://images.unsplash.com/photo-1597318181409-cf81d683f268?w=400&h=400&fit=crop", CategoryId = 1, SoldCount = 4300 },
            new() { Name = "Túi lọc hình thuyền", Slug = "tui-loc-hinh-thuyen", Price = 120000, ImageUrl = "https://images.unsplash.com/photo-1559494021-4d94f19f7023?w=400&h=400&fit=crop", CategoryId = 2, SoldCount = 980 },
            new() { Name = "Combo 100 túi lọc trà vải không dệt 5x7cm", Slug = "combo-100-tui-loc-5x7", Price = 50000, ImageUrl = "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop", CategoryId = 1, SoldCount = 3400 },
            new() { Name = "Combo 100 túi lọc trà vải không dệt 6x8cm", Slug = "combo-100-tui-loc-6x8", Price = 54000, ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop", CategoryId = 1, SoldCount = 2800 },
            new() { Name = "Combo 100 túi lọc giấy hàn nhiệt", Slug = "combo-100-tui-loc-giay-han-nhiet", Price = 40000, ImageUrl = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop", CategoryId = 3, SoldCount = 1900 },
            new() { Name = "Combo 100 Túi lọc trà lưới tam giác 4.8x6cm", Slug = "combo-100-tui-loc-4-8x6", Price = 40000, OriginalPrice = 80000, ImageUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=400&fit=crop", CategoryId = 2, SoldCount = 4100, IsSale = true },
            new() { Name = "Combo 100 túi lọc trà sợi ngô có dây rút", Slug = "combo-100-tui-loc-soi-ngo", Price = 118800, ImageUrl = "https://images.unsplash.com/photo-1597318181409-cf81d683f268?w=400&h=400&fit=crop", CategoryId = 4, SoldCount = 1600, IsSale = true },
            new() { Name = "Set 100 Túi đựng bánh cookie, trà hoa", Slug = "set-100-tui-dung-banh-cookie", Price = 42000, ImageUrl = "https://images.unsplash.com/photo-1558961363-fa8f82d0dbb9?w=400&h=400&fit=crop", CategoryId = 6, SoldCount = 2200 },
            new() { Name = "Máy hàn miệng túi cầm tay mini", Slug = "may-han-mieng-tui-mini", Price = 110000, ImageUrl = "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop", CategoryId = 6, SoldCount = 870 },
        };

        context.Products.AddRange(products);

        context.Coupons.AddRange(
            new Coupon { Title = "MIỄN PHÍ VC 20K", Code = "FREESHIP20", Description = "Cho toàn bộ sản phẩm của Shop" },
            new Coupon { Title = "GIAM10%", Code = "GIAM10", Description = "Cho đơn hàng từ 1 TRIỆU" },
            new Coupon { Title = "Giảm thêm 20k", Code = "VNPAY20", Description = "Khi thanh toán qua ví VNPay" },
            new Coupon { Title = "Giảm 15%", Code = "SALE15", Description = "Cho đơn tối thiểu 2 triệu" },
            new Coupon { Title = "Giảm ngay 1K", Code = "NEW1K", Description = "Cho khách hàng mua lần đầu tiên đơn hàng 50k" },
            new Coupon { Title = "Giảm 5%", Code = "VIP5", Description = "Cho khách hàng có hóa đơn trên 500k" }
        );

        context.NewsArticles.AddRange(
            new NewsArticle { Title = "Tìm hiểu về túi lọc trà – bước ngoặt trong ngành công nghiệp trà túi", Excerpt = "Sự ra đời của túi lọc trà đã mang trà đi đến khắp nơi, dùng trong nhiều tình huống như hội họp, dã ngoại...", ImageUrl = "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=200&fit=crop", PublishedAt = DateTime.UtcNow.AddDays(-3) },
            new NewsArticle { Title = "4 mẹo vặt hữu ích với túi lọc trà, đừng bỏ đi kẻo phí", Excerpt = "Sau khi pha nước uống, bạn đừng vội bỏ ngay túi lọc trà đi nhé, bởi chúng có thể tận dụng làm được rất nhiều việc hay ho.", ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop", PublishedAt = DateTime.UtcNow.AddDays(-5) },
            new NewsArticle { Title = "Túi lọc trà làm từ nhựa nguy hiểm thế nào?", Excerpt = "Một túi lọc trà bằng nhựa giải phóng khoảng 11,6 tỷ hạt vi nhựa vào cốc trà khi pha bằng nước nóng 95 độ.", ImageUrl = "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&h=200&fit=crop", PublishedAt = DateTime.UtcNow.AddDays(-7) },
            new NewsArticle { Title = "Túi lọc trà là gì và công dụng của túi trà lọc", Excerpt = "Túi lọc trà là dạng túi gói nhỏ dùng để đựng trà bên trong. Trà đựng trong túi là đã được sấy khô bằng nhiệt.", ImageUrl = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop", PublishedAt = DateTime.UtcNow.AddDays(-10) }
        );

        await context.SaveChangesAsync();
    }
}

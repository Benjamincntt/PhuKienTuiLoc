namespace PhuKienTuiLoc.Domain.Entities;

public class Customer
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    /// <summary>Null nếu khách chỉ đăng nhập bằng Google.</summary>
    public string? PasswordHash { get; set; }
    /// <summary>Google subject id (sub) nếu liên kết tài khoản Google.</summary>
    public string? GoogleId { get; set; }
    public int LoyaltyPoints { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = [];
}

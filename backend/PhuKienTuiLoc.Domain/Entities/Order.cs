namespace PhuKienTuiLoc.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string CouponCode { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = OrderStatus.Pending;

    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    /// <summary>COD | VNPAY | MOMO</summary>
    public string PaymentMethod { get; set; } = PaymentMethods.Cod;
    /// <summary>Unpaid | Paid | Failed</summary>
    public string PaymentStatus { get; set; } = PaymentStatuses.Unpaid;
    /// <summary>Mã giao dịch trả về từ cổng thanh toán.</summary>
    public string PaymentRef { get; set; } = string.Empty;
    public int PointsEarned { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<OrderItem> Items { get; set; } = [];
}

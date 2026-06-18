namespace PhuKienTuiLoc.Application.DTOs;

public record OrderItemDto(
    int Id,
    int ProductId,
    string ProductName,
    decimal Price,
    int Quantity,
    decimal SubTotal
);

public record OrderDto(
    int Id,
    string CustomerName,
    string CustomerPhone,
    string CustomerAddress,
    string Note,
    string CouponCode,
    decimal DiscountAmount,
    decimal TotalPrice,
    string Status,
    string PaymentMethod,
    string PaymentStatus,
    int PointsEarned,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDto> Items
);

public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class CreateOrderDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string CouponCode { get; set; } = string.Empty;
    /// <summary>COD | VNPAY | MOMO. Mặc định COD.</summary>
    public string PaymentMethod { get; set; } = "COD";
    public List<CreateOrderItemDto> Items { get; set; } = [];
}

/// <summary>Kết quả tạo đơn — kèm URL thanh toán nếu chọn cổng online.</summary>
public record CreateOrderResultDto(OrderDto Order, string? PaymentUrl, bool EmailNotificationSent = false);

public record OrderPublicDto(
    int Id,
    decimal TotalPrice,
    string Status,
    string PaymentMethod,
    string PaymentStatus,
    int PointsEarned,
    DateTime CreatedAt);

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

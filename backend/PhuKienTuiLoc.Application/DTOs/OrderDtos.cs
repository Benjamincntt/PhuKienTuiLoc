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
    public List<CreateOrderItemDto> Items { get; set; } = [];
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

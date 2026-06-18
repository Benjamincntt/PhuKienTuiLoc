using Microsoft.Extensions.Options;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Application.Mappings;
using PhuKienTuiLoc.Application.Configuration;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;

namespace PhuKienTuiLoc.Application.Services;

public class OrderService(
    IUnitOfWork unitOfWork,
    IPaymentService paymentService,
    IOrderNotificationService orderNotificationService,
    IOptions<PaymentFeatureSettings> paymentFeatureOptions) : IOrderService
{
    private readonly PaymentFeatureSettings _payments = paymentFeatureOptions.Value;

    public async Task<PagedResult<OrderDto>> GetAllAsync(OrderQuery query, CancellationToken cancellationToken = default)
    {
        var result = await unitOfWork.Orders.GetPagedAsync(query, cancellationToken);
        return new PagedResult<OrderDto>
        {
            Items = result.Items.Select(o => o.ToDto()).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
        };
    }

    public async Task<OrderDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await unitOfWork.Orders.GetByIdWithItemsAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order id {id} was not found.");
        return order.ToDto();
    }

    public async Task<CreateOrderResultDto> CreateAsync(
        CreateOrderDto dto,
        int? customerId = null,
        string? clientIp = null,
        CancellationToken cancellationToken = default)
    {
        if (dto.Items is null || dto.Items.Count == 0)
            throw new ArgumentException("Order must contain at least one item.");

        var paymentMethod = ResolvePaymentMethod(dto.PaymentMethod);

        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = new List<Product>();
        foreach (var pid in productIds)
        {
            var product = await unitOfWork.Products.GetByIdWithDetailsAsync(pid, cancellationToken)
                ?? throw new NotFoundException($"Product id {pid} was not found.");
            products.Add(product);
        }

        var productMap = products.ToDictionary(p => p.Id);
        var orderItems = dto.Items.Select(i =>
        {
            var product = productMap[i.ProductId];
            return new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Price = product.Price,
                Quantity = i.Quantity,
            };
        }).ToList();

        var subtotal = orderItems.Sum(i => i.Price * i.Quantity);

        decimal discountAmount = 0;
        string couponCode = string.Empty;
        Coupon? coupon = null;

        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            coupon = await unitOfWork.Coupons.GetByCodeAsync(dto.CouponCode, cancellationToken);
            if (coupon is null || !coupon.IsActive)
                throw new ArgumentException("Mã giảm giá không hợp lệ.");
            if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < DateTime.UtcNow)
                throw new ArgumentException("Mã giảm giá đã hết hạn.");
            if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses.Value)
                throw new ArgumentException("Mã giảm giá đã hết lượt sử dụng.");
            if (subtotal < coupon.MinOrderAmount)
                throw new ArgumentException($"Đơn hàng tối thiểu {coupon.MinOrderAmount:N0}đ để dùng mã này.");

            discountAmount = CouponService.CalculateDiscount(coupon, subtotal);
            couponCode = coupon.Code;
        }

        var order = new Order
        {
            CustomerName = dto.CustomerName.Trim(),
            CustomerPhone = dto.CustomerPhone.Trim(),
            CustomerAddress = dto.CustomerAddress.Trim(),
            Note = dto.Note?.Trim() ?? string.Empty,
            CouponCode = couponCode,
            DiscountAmount = discountAmount,
            TotalPrice = subtotal - discountAmount,
            Status = OrderStatus.Pending,
            CustomerId = customerId,
            PaymentMethod = paymentMethod,
            PaymentStatus = PaymentStatuses.Unpaid,
            CreatedAt = DateTime.UtcNow,
            Items = orderItems,
        };

        unitOfWork.Orders.Add(order);

        if (coupon is not null)
            coupon.UsedCount++;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        string? paymentUrl = null;
        var emailSent = false;
        if (_payments.OnlineEnabled && paymentMethod is not PaymentMethods.Cod)
        {
            paymentUrl = await paymentService.CreatePaymentUrlAsync(order, clientIp ?? "127.0.0.1", cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            emailSent = await orderNotificationService.SendNewOrderNotificationAsync(order, cancellationToken);
        }

        return new CreateOrderResultDto(order.ToDto(), paymentUrl, emailSent);
    }

    public async Task<OrderPublicDto?> GetPublicAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await unitOfWork.Orders.GetByIdWithItemsAsync(id, cancellationToken);
        return order is null
            ? null
            : new OrderPublicDto(
                order.Id,
                order.TotalPrice,
                order.Status,
                order.PaymentMethod,
                order.PaymentStatus,
                order.PointsEarned,
                order.CreatedAt);
    }

    public async Task<OrderDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto, CancellationToken cancellationToken = default)
    {
        if (!OrderStatus.IsValid(dto.Status))
            throw new ArgumentException($"Invalid order status: {dto.Status}");

        var order = await unitOfWork.Orders.GetByIdTrackedAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order id {id} was not found.");

        order.Status = dto.Status;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return order.ToDto();
    }

    public async Task<IReadOnlyList<OrderDto>> GetMyOrdersAsync(int customerId, CancellationToken cancellationToken = default)
    {
        var orders = await unitOfWork.Orders.GetByCustomerAsync(customerId, cancellationToken);
        return orders.Select(o => o.ToDto()).ToList();
    }

    private string ResolvePaymentMethod(string? requested)
    {
        if (!_payments.OnlineEnabled)
            return PaymentMethods.Cod;

        var paymentMethod = string.IsNullOrWhiteSpace(requested)
            ? PaymentMethods.VnPay
            : requested.ToUpperInvariant();

        if (paymentMethod == PaymentMethods.Cod)
            throw new ArgumentException("Vui lòng chọn thanh toán Momo hoặc VNPay để nhận hàng.");

        if (!PaymentMethods.IsValid(paymentMethod) || paymentMethod == PaymentMethods.Cod)
            throw new ArgumentException("Phương thức thanh toán không hợp lệ.");

        return paymentMethod;
    }
}

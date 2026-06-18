using System.Globalization;
using System.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Infrastructure.Configuration;

namespace PhuKienTuiLoc.Infrastructure.Notifications;

public class OrderEmailNotificationService(
    IOptions<OrderNotificationSettings> notificationOptions,
    IOptions<SmtpSettings> smtpOptions,
    ILogger<OrderEmailNotificationService> logger) : IOrderNotificationService
{
    private readonly OrderNotificationSettings _notification = notificationOptions.Value;
    private readonly SmtpSettings _smtp = smtpOptions.Value;

    public async Task<bool> SendNewOrderNotificationAsync(Order order, CancellationToken cancellationToken = default)
    {
        if (!_notification.Enabled || string.IsNullOrWhiteSpace(_notification.RecipientEmail))
            return false;

        if (string.IsNullOrWhiteSpace(_smtp.Username) || string.IsNullOrWhiteSpace(_smtp.Password))
        {
            logger.LogWarning(
                "Đơn hàng #{OrderId}: chưa gửi email — thiếu Smtp:Password. Tạo App Password Gmail rồi đặt vào appsettings hoặc user-secrets.",
                order.Id);
            return false;
        }

        try
        {
            var fromEmail = string.IsNullOrWhiteSpace(_smtp.FromEmail) ? _smtp.Username : _smtp.FromEmail;
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_smtp.FromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(_notification.RecipientEmail.Trim()));
            message.Subject = $"[AnTea] Don hang moi #{order.Id} - {order.CustomerName}";

            var body = BuildEmailBody(order);
            message.Body = new TextPart("plain") { Text = body };

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtp.Host, _smtp.Port, SecureSocketOptions.StartTls, cancellationToken);
            await client.AuthenticateAsync(_smtp.Username, _smtp.Password, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            logger.LogInformation("Da gui email don hang #{OrderId} toi {Recipient}", order.Id, _notification.RecipientEmail);
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Gui email don hang #{OrderId} that bai: {Message}", order.Id, ex.Message);
            return false;
        }
    }

    private static string BuildEmailBody(Order order)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Có đơn hàng mới từ website AnTea");
        sb.AppendLine(new string('-', 40));
        sb.AppendLine($"Mã đơn: #{order.Id}");
        sb.AppendLine($"Thời gian: {order.CreatedAt.ToLocalTime():dd/MM/yyyy HH:mm:ss}");
        sb.AppendLine();
        sb.AppendLine("THÔNG TIN KHÁCH HÀNG");
        sb.AppendLine($"Họ tên: {order.CustomerName}");
        sb.AppendLine($"SĐT: {order.CustomerPhone}");
        sb.AppendLine($"Địa chỉ: {order.CustomerAddress}");
        if (!string.IsNullOrWhiteSpace(order.Note))
            sb.AppendLine($"Ghi chú: {order.Note}");
        sb.AppendLine();
        sb.AppendLine("SẢN PHẨM");
        foreach (var item in order.Items)
        {
            sb.AppendLine(
                $"- {item.ProductName} x{item.Quantity} = {(item.Price * item.Quantity).ToString("N0", CultureInfo.InvariantCulture)}đ");
        }

        sb.AppendLine();
        if (!string.IsNullOrWhiteSpace(order.CouponCode))
        {
            sb.AppendLine($"Mã giảm giá: {order.CouponCode}");
            sb.AppendLine($"Giảm: {order.DiscountAmount.ToString("N0", CultureInfo.InvariantCulture)}đ");
        }

        sb.AppendLine($"Tổng thanh toán: {order.TotalPrice.ToString("N0", CultureInfo.InvariantCulture)}đ");
        sb.AppendLine($"Phương thức: Thanh toán khi nhận hàng (COD)");
        sb.AppendLine();
        sb.AppendLine("Vui lòng liên hệ khách để xác nhận đơn.");
        return sb.ToString();
    }
}

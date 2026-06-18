using System.Globalization;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;
using PhuKienTuiLoc.Infrastructure.Configuration;

namespace PhuKienTuiLoc.Infrastructure.Payments;

public class PaymentService(
    IUnitOfWork unitOfWork,
    IOptions<VnPaySettings> vnPayOptions,
    IOptions<MomoSettings> momoOptions,
    IOptions<SiteSettings> siteOptions,
    IHttpClientFactory httpClientFactory) : IPaymentService
{
    private readonly VnPaySettings _vnPay = vnPayOptions.Value;
    private readonly MomoSettings _momo = momoOptions.Value;
    private readonly SiteSettings _site = siteOptions.Value;

    public Task<string> CreatePaymentUrlAsync(Order order, string clientIp, CancellationToken cancellationToken = default)
    {
        return order.PaymentMethod switch
        {
            PaymentMethods.VnPay => Task.FromResult(CreateVnPayUrl(order, clientIp)),
            PaymentMethods.Momo => CreateMomoUrlAsync(order, clientIp, cancellationToken),
            _ => throw new ValidationException("Chỉ hỗ trợ thanh toán VNPay hoặc Momo."),
        };
    }

    public async Task<(int OrderId, bool Success, string Message)> ProcessVnPayReturnAsync(
        IReadOnlyDictionary<string, string> queryParams,
        CancellationToken cancellationToken = default)
    {
        if (!ValidateVnPaySignature(queryParams, out var data))
            return (0, false, "Chữ ký VNPay không hợp lệ.");

        if (!TryParseOrderId(data.GetValueOrDefault("vnp_TxnRef"), out var orderId))
            return (0, false, "Mã đơn hàng không hợp lệ.");

        var responseCode = data.GetValueOrDefault("vnp_ResponseCode");
        var transactionNo = data.GetValueOrDefault("vnp_TransactionNo") ?? "";

        if (responseCode == "00")
        {
            await MarkOrderPaidAsync(orderId, transactionNo, cancellationToken);
            return (orderId, true, "Thanh toán thành công.");
        }

        await MarkOrderFailedAsync(orderId, cancellationToken);
        return (orderId, false, VnPayResponseMessage(responseCode));
    }

    public async Task<(bool Success, string ResponseCode)> ProcessVnPayIpnAsync(
        IReadOnlyDictionary<string, string> queryParams,
        CancellationToken cancellationToken = default)
    {
        if (!ValidateVnPaySignature(queryParams, out var data))
            return (false, "97");

        if (!TryParseOrderId(data.GetValueOrDefault("vnp_TxnRef"), out var orderId))
            return (false, "01");

        var responseCode = data.GetValueOrDefault("vnp_ResponseCode");
        if (responseCode == "00")
        {
            await MarkOrderPaidAsync(orderId, data.GetValueOrDefault("vnp_TransactionNo") ?? "", cancellationToken);
            return (true, "00");
        }

        await MarkOrderFailedAsync(orderId, cancellationToken);
        return (true, "00");
    }

    public async Task<(int OrderId, bool Success, string Message)> ProcessMomoReturnAsync(
        IReadOnlyDictionary<string, string> queryParams,
        CancellationToken cancellationToken = default)
    {
        if (!int.TryParse(queryParams.GetValueOrDefault("orderId"), out var orderId))
            return (0, false, "Mã đơn hàng không hợp lệ.");

        var resultCode = queryParams.GetValueOrDefault("resultCode");
        var transId = queryParams.GetValueOrDefault("transId") ?? queryParams.GetValueOrDefault("transid") ?? "";

        if (resultCode == "0")
        {
            await MarkOrderPaidAsync(orderId, transId, cancellationToken);
            return (orderId, true, "Thanh toán thành công.");
        }

        await MarkOrderFailedAsync(orderId, cancellationToken);
        return (orderId, false, MomoResultMessage(resultCode));
    }

    public async Task ProcessMomoIpnAsync(string jsonBody, CancellationToken cancellationToken = default)
    {
        using var doc = JsonDocument.Parse(jsonBody);
        var root = doc.RootElement;

        var signature = root.TryGetProperty("signature", out var sigEl) ? sigEl.GetString() : null;
        var orderIdStr = root.TryGetProperty("orderId", out var oid) ? oid.GetString() : null;
        var resultCode = root.TryGetProperty("resultCode", out var rc) ? rc.GetInt32() : -1;
        var transId = root.TryGetProperty("transId", out var tid) ? tid.GetInt64().ToString() : "";

        if (string.IsNullOrEmpty(signature) || string.IsNullOrEmpty(orderIdStr))
            return;

        var amount = root.TryGetProperty("amount", out var am) ? am.GetInt64() : 0L;
        var message = root.TryGetProperty("message", out var msg) ? msg.GetString() ?? "" : "";
        var orderInfo = root.TryGetProperty("orderInfo", out var oi) ? oi.GetString() ?? "" : "";
        var partnerCode = root.TryGetProperty("partnerCode", out var pc) ? pc.GetString() ?? "" : "";
        var requestId = root.TryGetProperty("requestId", out var rid) ? rid.GetString() ?? "" : "";
        var responseTime = root.TryGetProperty("responseTime", out var rt) ? rt.GetInt64() : 0L;
        var extraData = root.TryGetProperty("extraData", out var ed) ? ed.GetString() ?? "" : "";
        var orderType = root.TryGetProperty("orderType", out var ot) ? ot.GetString() ?? "" : "";
        var payType = root.TryGetProperty("payType", out var pt) ? pt.GetString() ?? "" : "";

        var rawHash =
            $"accessKey={_momo.AccessKey}&amount={amount}&extraData={extraData}&message={message}&orderId={orderIdStr}&orderInfo={orderInfo}&orderType={orderType}&partnerCode={partnerCode}&payType={payType}&requestId={requestId}&responseTime={responseTime}&resultCode={resultCode}&transId={transId}";

        if (!string.Equals(signature, HmacSha256(rawHash, _momo.SecretKey), StringComparison.OrdinalIgnoreCase))
            return;

        if (!int.TryParse(orderIdStr, out var orderId))
            return;

        if (resultCode == 0)
            await MarkOrderPaidAsync(orderId, transId, cancellationToken);
        else
            await MarkOrderFailedAsync(orderId, cancellationToken);
    }

    private string CreateVnPayUrl(Order order, string clientIp)
    {
        EnsureVnPayConfigured();

        var txnRef = BuildTxnRef(order.Id);
        var returnUrl = $"{_site.BackendUrl.TrimEnd('/')}/api/payments/vnpay/return";

        var parameters = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Amount"] = ((long)Math.Round(order.TotalPrice * 100, MidpointRounding.AwayFromZero)).ToString(CultureInfo.InvariantCulture),
            ["vnp_Command"] = _vnPay.Command,
            ["vnp_CreateDate"] = VnPayHelper.GetCreateDate(),
            ["vnp_CurrCode"] = _vnPay.CurrCode,
            ["vnp_IpAddr"] = VnPayHelper.NormalizeClientIp(clientIp),
            ["vnp_Locale"] = _vnPay.Locale,
            ["vnp_OrderInfo"] = $"Thanh toan don hang {order.Id}",
            ["vnp_OrderType"] = "other",
            ["vnp_ReturnUrl"] = returnUrl,
            ["vnp_TmnCode"] = _vnPay.TmnCode.Trim(),
            ["vnp_TxnRef"] = txnRef,
            ["vnp_Version"] = _vnPay.Version,
        };

        order.PaymentRef = txnRef;
        return VnPayHelper.CreatePaymentUrl(_vnPay.PaymentUrl, parameters, _vnPay.HashSecret);
    }

    private async Task<string> CreateMomoUrlAsync(Order order, string clientIp, CancellationToken cancellationToken)
    {
        EnsureMomoConfigured();

        var requestId = Guid.NewGuid().ToString();
        var orderId = order.Id.ToString();
        var amount = (long)order.TotalPrice;
        var orderInfo = $"Thanh toan don hang #{order.Id}";
        var redirectUrl = $"{_site.BackendUrl.TrimEnd('/')}/api/payments/momo/return";
        var ipnUrl = $"{_site.BackendUrl.TrimEnd('/')}/api/payments/momo/ipn";
        const string extraData = "";

        var rawHash =
            $"accessKey={_momo.AccessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={_momo.PartnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={_momo.RequestType}";

        var signature = HmacSha256(rawHash, _momo.SecretKey);

        var payload = new
        {
            partnerCode = _momo.PartnerCode,
            partnerName = _momo.PartnerName,
            storeId = _momo.StoreId,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang = "vi",
            requestType = _momo.RequestType,
            extraData,
            signature,
        };

        var client = httpClientFactory.CreateClient();
        using var response = await client.PostAsJsonAsync(_momo.Endpoint, payload, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
            throw new ValidationException($"Momo từ chối yêu cầu: {body}");

        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;
        var resultCode = root.TryGetProperty("resultCode", out var rc) ? rc.GetInt32() : -1;
        if (resultCode != 0)
        {
            var message = root.TryGetProperty("message", out var msg) ? msg.GetString() : "Lỗi không xác định";
            throw new ValidationException($"Momo: {message}");
        }

        var payUrl = root.GetProperty("payUrl").GetString()
            ?? throw new ValidationException("Momo không trả về payUrl.");

        order.PaymentRef = requestId;
        return payUrl;
    }

    private async Task MarkOrderPaidAsync(int orderId, string paymentRef, CancellationToken cancellationToken)
    {
        var order = await unitOfWork.Orders.GetByIdTrackedAsync(orderId, cancellationToken);
        if (order is null || order.PaymentStatus == PaymentStatuses.Paid)
            return;

        order.PaymentStatus = PaymentStatuses.Paid;
        if (!string.IsNullOrWhiteSpace(paymentRef))
            order.PaymentRef = paymentRef;

        var points = (int)Math.Floor(order.TotalPrice / 10_000m);
        order.PointsEarned = points;

        if (order.CustomerId is int customerId)
        {
            var customer = await unitOfWork.Customers.GetTrackedAsync(customerId, cancellationToken);
            if (customer is not null)
                customer.LoyaltyPoints += points;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task MarkOrderFailedAsync(int orderId, CancellationToken cancellationToken)
    {
        var order = await unitOfWork.Orders.GetByIdTrackedAsync(orderId, cancellationToken);
        if (order is null || order.PaymentStatus == PaymentStatuses.Paid)
            return;

        order.PaymentStatus = PaymentStatuses.Failed;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private bool ValidateVnPaySignature(IReadOnlyDictionary<string, string> queryParams, out Dictionary<string, string> data)
    {
        return VnPayHelper.ValidateSignature(queryParams, _vnPay.HashSecret, out data);
    }

    private static bool TryParseOrderId(string? txnRef, out int orderId)
    {
        orderId = 0;
        if (string.IsNullOrWhiteSpace(txnRef))
            return false;

        var idPart = txnRef.Split('_')[0];
        return int.TryParse(idPart, out orderId);
    }

    private static string BuildTxnRef(int orderId) => $"{orderId}_{DateTime.UtcNow:yyyyMMddHHmmss}";

    private void EnsureVnPayConfigured()
    {
        if (string.IsNullOrWhiteSpace(_vnPay.TmnCode) || string.IsNullOrWhiteSpace(_vnPay.HashSecret))
            throw new ValidationException("VNPay chưa được cấu hình. Thêm TmnCode và HashSecret vào appsettings.");
    }

    private void EnsureMomoConfigured()
    {
        if (string.IsNullOrWhiteSpace(_momo.PartnerCode) ||
            string.IsNullOrWhiteSpace(_momo.AccessKey) ||
            string.IsNullOrWhiteSpace(_momo.SecretKey))
            throw new ValidationException("Momo chưa được cấu hình. Thêm PartnerCode, AccessKey, SecretKey vào appsettings.");
    }

    private static string HmacSha256(string data, string key)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var hash = HMACSHA256.HashData(keyBytes, dataBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string VnPayResponseMessage(string? code) => code switch
    {
        "00" => "Thanh toán thành công.",
        "07" => "Giao dịch bị nghi ngờ.",
        "09" => "Thẻ/Tài khoản chưa đăng ký InternetBanking.",
        "10" => "Xác thực thông tin không đúng quá 3 lần.",
        "11" => "Hết hạn chờ thanh toán.",
        "12" => "Thẻ/Tài khoản bị khóa.",
        "13" => "Nhập sai OTP.",
        "24" => "Khách hàng hủy giao dịch.",
        "51" => "Tài khoản không đủ số dư.",
        "65" => "Vượt hạn mức giao dịch trong ngày.",
        _ => "Thanh toán thất bại.",
    };

    private static string MomoResultMessage(string? code) => code switch
    {
        "0" => "Thanh toán thành công.",
        "49" => "Khách hàng hủy giao dịch.",
        _ => "Thanh toán thất bại.",
    };
}

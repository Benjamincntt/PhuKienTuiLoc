namespace PhuKienTuiLoc.Application.Configuration;

/// <summary>Bật/tắt thanh toán online (VNPay/Momo). Tắt = COD + gửi email đơn hàng.</summary>
public class PaymentFeatureSettings
{
    public bool OnlineEnabled { get; set; }
}

namespace PhuKienTuiLoc.Infrastructure.Configuration;

public class MomoSettings
{
    public string PartnerCode { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = "https://test-payment.momo.vn/v2/gateway/api/create";
    public string PartnerName { get; set; } = "AnTea";
    public string StoreId { get; set; } = "AnTeaStore";
    public string RequestType { get; set; } = "captureWallet";
}

namespace PhuKienTuiLoc.Infrastructure.Configuration;

public class SiteSettings
{
    /// <summary>URL frontend (dùng redirect sau thanh toán). VD: http://localhost:5173 hoặc https://baobiantea.com</summary>
    public string FrontendUrl { get; set; } = "http://localhost:5173";

    /// <summary>URL backend public (dùng cho IPN/callback). VD: http://localhost:5280 hoặc https://baobiantea.com</summary>
    public string BackendUrl { get; set; } = "http://localhost:5280";
}

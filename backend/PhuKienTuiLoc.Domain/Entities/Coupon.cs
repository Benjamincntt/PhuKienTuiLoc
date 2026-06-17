namespace PhuKienTuiLoc.Domain.Entities;

public class Coupon
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>"Percent" hoặc "Fixed"</summary>
    public string DiscountType { get; set; } = DiscountTypes.Percent;

    /// <summary>Nếu Percent: 0–100. Nếu Fixed: số tiền VND.</summary>
    public decimal DiscountValue { get; set; }

    /// <summary>Đơn hàng tối thiểu để áp dụng mã (0 = không yêu cầu)</summary>
    public decimal MinOrderAmount { get; set; }

    /// <summary>null = không giới hạn lần dùng</summary>
    public int? MaxUses { get; set; }

    /// <summary>Đếm số lần đã được sử dụng thành công</summary>
    public int UsedCount { get; set; }

    /// <summary>null = không hết hạn</summary>
    public DateTime? ExpiresAt { get; set; }

    public bool IsActive { get; set; } = true;
}

public static class DiscountTypes
{
    public const string Percent = "Percent";
    public const string Fixed = "Fixed";
}

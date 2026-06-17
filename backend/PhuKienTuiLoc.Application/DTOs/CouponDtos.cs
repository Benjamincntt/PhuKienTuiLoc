namespace PhuKienTuiLoc.Application.DTOs;

public record CouponDto(
    int Id,
    string Title,
    string Code,
    string Description,
    string DiscountType,
    decimal DiscountValue,
    decimal MinOrderAmount,
    int? MaxUses,
    int UsedCount,
    DateTime? ExpiresAt,
    bool IsActive
);

public class CreateCouponDto
{
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Percent";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCouponDto
{
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Percent";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ValidateCouponDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}

public record ValidateCouponResultDto(
    bool IsValid,
    string? ErrorMessage,
    decimal DiscountAmount,
    decimal FinalAmount,
    CouponDto? Coupon
);

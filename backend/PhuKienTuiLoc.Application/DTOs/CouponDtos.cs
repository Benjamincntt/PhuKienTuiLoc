namespace PhuKienTuiLoc.Application.DTOs;

public record CouponDto(int Id, string Title, string Code, string Description);

public class CreateCouponDto
{
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class UpdateCouponDto
{
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

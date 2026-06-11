namespace PhuKienTuiLoc.Domain.Entities;

public class Coupon
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

namespace PhuKienTuiLoc.Domain.Entities;

public static class OrderStatus
{
    public const string Pending = "Pending";
    public const string Confirmed = "Confirmed";
    public const string Shipping = "Shipping";
    public const string Delivered = "Delivered";
    public const string Cancelled = "Cancelled";

    public static readonly string[] All = [Pending, Confirmed, Shipping, Delivered, Cancelled];

    public static bool IsValid(string status) => All.Contains(status);
}

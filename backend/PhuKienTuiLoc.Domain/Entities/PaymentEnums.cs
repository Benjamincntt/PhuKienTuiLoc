namespace PhuKienTuiLoc.Domain.Entities;

public static class PaymentMethods
{
    public const string Cod = "COD";
    public const string VnPay = "VNPAY";
    public const string Momo = "MOMO";

    public static readonly string[] All = [Cod, VnPay, Momo];

    public static bool IsValid(string method) => All.Contains(method);
}

public static class PaymentStatuses
{
    public const string Unpaid = "Unpaid";
    public const string Paid = "Paid";
    public const string Failed = "Failed";

    public static readonly string[] All = [Unpaid, Paid, Failed];

    public static bool IsValid(string status) => All.Contains(status);
}

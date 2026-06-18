using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace PhuKienTuiLoc.Infrastructure.Payments;

/// <summary>
/// Thuật toán ký VNPay theo mẫu VnPayLibrary (PHP urlencode + HMACSHA512).
/// </summary>
internal static class VnPayHelper
{
    public static string CreatePaymentUrl(
        string baseUrl,
        IReadOnlyDictionary<string, string> parameters,
        string hashSecret)
    {
        var signData = BuildSignData(parameters);
        var secureHash = HmacSha512(signData, hashSecret.Trim());
        return $"{baseUrl}?{signData}&vnp_SecureHash={secureHash}";
    }

    public static bool ValidateSignature(
        IReadOnlyDictionary<string, string> queryParams,
        string hashSecret,
        out Dictionary<string, string> data)
    {
        data = queryParams
            .Where(p => !string.Equals(p.Key, "vnp_SecureHash", StringComparison.OrdinalIgnoreCase)
                        && !string.Equals(p.Key, "vnp_SecureHashType", StringComparison.OrdinalIgnoreCase))
            .ToDictionary(p => p.Key, p => p.Value, StringComparer.OrdinalIgnoreCase);

        if (!queryParams.TryGetValue("vnp_SecureHash", out var secureHash))
            return false;

        var signData = BuildSignData(data);
        var computed = HmacSha512(signData, hashSecret.Trim());
        return string.Equals(computed, secureHash, StringComparison.OrdinalIgnoreCase);
    }

    public static string GetCreateDate()
    {
        try
        {
            var vnTime = TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.UtcNow,
                TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"));
            return vnTime.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
        }
        catch (TimeZoneNotFoundException)
        {
            return DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
        }
    }

    public static string NormalizeClientIp(string? clientIp)
    {
        if (string.IsNullOrWhiteSpace(clientIp))
            return "127.0.0.1";

        if (clientIp.StartsWith("::ffff:", StringComparison.OrdinalIgnoreCase))
            clientIp = clientIp["::ffff:".Length..];

        return clientIp;
    }

    private static string BuildSignData(IReadOnlyDictionary<string, string> parameters)
    {
        var sorted = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var pair in parameters)
        {
            if (!string.IsNullOrEmpty(pair.Value))
                sorted[pair.Key] = pair.Value;
        }

        return string.Join("&", sorted.Select(p =>
            $"{UrlEncode(p.Key)}={UrlEncode(p.Value)}"));
    }

    /// <summary>PHP urlencode: khoảng trắng thành '+', ký tự đặc biệt thành %XX.</summary>
    private static string UrlEncode(string value) =>
        WebUtility.UrlEncode(value).Replace("%20", "+", StringComparison.Ordinal);

    private static string HmacSha512(string data, string key)
    {
        var hash = HMACSHA512.HashData(Encoding.UTF8.GetBytes(key), Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}

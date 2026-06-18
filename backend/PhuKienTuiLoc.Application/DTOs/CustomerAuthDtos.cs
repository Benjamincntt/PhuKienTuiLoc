namespace PhuKienTuiLoc.Application.DTOs;

public class CustomerRegisterDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Password { get; set; } = string.Empty;
}

public class CustomerLoginDto
{
    /// <summary>Email hoặc số điện thoại.</summary>
    public string Identifier { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class GoogleLoginDto
{
    public string IdToken { get; set; } = string.Empty;
}

public record CustomerProfileDto(
    int Id,
    string FullName,
    string? Email,
    string? Phone,
    int LoyaltyPoints);

public record CustomerAuthResponseDto(
    string Token,
    DateTime ExpiresAt,
    CustomerProfileDto Customer);

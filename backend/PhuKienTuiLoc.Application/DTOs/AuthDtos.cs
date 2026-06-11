namespace PhuKienTuiLoc.Application.DTOs;

public class LoginRequestDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public record LoginResponseDto(string Token, string Username, string Role, DateTime ExpiresAt);

public record AdminProfileDto(int Id, string Username, string Role);

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Infrastructure.Configuration;

namespace PhuKienTuiLoc.Infrastructure.Auth;

public class AuthService(IUnitOfWork unitOfWork, IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly JwtSettings _jwt = jwtOptions.Value;

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.AdminUsers.GetByUsernameAsync(request.Username, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var expiresAt = DateTime.UtcNow.AddHours(_jwt.ExpiresHours);
        var token = GenerateToken(user.Username, user.Role, expiresAt);

        return new LoginResponseDto(token, user.Username, user.Role, expiresAt);
    }

    public async Task<AdminProfileDto?> GetProfileAsync(string username, CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.AdminUsers.GetByUsernameAsync(username, cancellationToken);
        return user is null ? null : new AdminProfileDto(user.Id, user.Username, user.Role);
    }

    private string GenerateToken(string username, string role, DateTime expiresAt)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common.Authorization;
using PhuKienTuiLoc.Application.DTOs;
using PhuKienTuiLoc.Domain.Entities;
using PhuKienTuiLoc.Domain.Exceptions;
using PhuKienTuiLoc.Infrastructure.Configuration;

namespace PhuKienTuiLoc.Infrastructure.Auth;

public class CustomerAuthService(
    IUnitOfWork unitOfWork,
    IOptions<JwtSettings> jwtOptions,
    IOptions<GoogleAuthSettings> googleOptions,
    IHttpClientFactory httpClientFactory) : ICustomerAuthService
{
    private readonly JwtSettings _jwt = jwtOptions.Value;
    private readonly GoogleAuthSettings _google = googleOptions.Value;

    // Token cho khách hàng giữ đăng nhập lâu hơn admin (30 ngày).
    private const int CustomerTokenDays = 30;

    public async Task<CustomerAuthResponseDto> RegisterAsync(CustomerRegisterDto dto, CancellationToken cancellationToken = default)
    {
        var fullName = (dto.FullName ?? string.Empty).Trim();
        var email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim().ToLowerInvariant();
        var phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();

        if (fullName.Length < 2)
            throw new ValidationException("Vui lòng nhập họ tên.");
        if (email is null && phone is null)
            throw new ValidationException("Cần nhập email hoặc số điện thoại.");
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            throw new ValidationException("Mật khẩu phải có ít nhất 6 ký tự.");

        if (email is not null && await unitOfWork.Customers.ExistsEmailAsync(email, cancellationToken))
            throw new ConflictException("Email đã tồn tại", "Email này đã được đăng ký.");
        if (phone is not null && await unitOfWork.Customers.ExistsPhoneAsync(phone, cancellationToken))
            throw new ConflictException("Số điện thoại đã tồn tại", "Số điện thoại này đã được đăng ký.");

        var customer = new Customer
        {
            FullName = fullName,
            Email = email,
            Phone = phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        };

        await unitOfWork.Customers.AddAsync(customer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return BuildResponse(customer);
    }

    public async Task<CustomerAuthResponseDto?> LoginAsync(CustomerLoginDto dto, CancellationToken cancellationToken = default)
    {
        var identifier = (dto.Identifier ?? string.Empty).Trim();
        if (identifier.Contains('@')) identifier = identifier.ToLowerInvariant();

        var customer = await unitOfWork.Customers.GetByEmailOrPhoneAsync(identifier, cancellationToken);
        if (customer?.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
            return null;

        return BuildResponse(customer);
    }

    public async Task<CustomerAuthResponseDto?> GoogleLoginAsync(GoogleLoginDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_google.ClientId))
            throw new ValidationException("Đăng nhập Google chưa được cấu hình.");
        if (string.IsNullOrWhiteSpace(dto.IdToken))
            throw new ValidationException("Thiếu Google id token.");

        var payload = await VerifyGoogleTokenAsync(dto.IdToken, cancellationToken);
        if (payload is null)
            return null;

        var customer = await unitOfWork.Customers.GetByGoogleIdAsync(payload.Sub, cancellationToken);

        if (customer is null && payload.Email is not null)
        {
            // Liên kết với tài khoản email sẵn có nếu trùng email.
            var existing = await unitOfWork.Customers.GetByEmailAsync(payload.Email, cancellationToken);
            if (existing is not null)
            {
                var tracked = await unitOfWork.Customers.GetTrackedAsync(existing.Id, cancellationToken);
                if (tracked is not null)
                {
                    tracked.GoogleId = payload.Sub;
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                    customer = tracked;
                }
            }
        }

        if (customer is null)
        {
            customer = new Customer
            {
                FullName = string.IsNullOrWhiteSpace(payload.Name) ? "Khách Google" : payload.Name,
                Email = payload.Email,
                GoogleId = payload.Sub,
            };
            await unitOfWork.Customers.AddAsync(customer, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return BuildResponse(customer);
    }

    public async Task<CustomerProfileDto?> GetProfileAsync(int customerId, CancellationToken cancellationToken = default)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(customerId, cancellationToken);
        return customer is null ? null : ToProfile(customer);
    }

    private async Task<GooglePayload?> VerifyGoogleTokenAsync(string idToken, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient();
        var response = await client.GetAsync(
            $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(idToken)}",
            cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = doc.RootElement;

        var aud = root.TryGetProperty("aud", out var a) ? a.GetString() : null;
        if (aud != _google.ClientId)
            return null;

        var sub = root.TryGetProperty("sub", out var s) ? s.GetString() : null;
        if (string.IsNullOrEmpty(sub))
            return null;

        var email = root.TryGetProperty("email", out var e) ? e.GetString() : null;
        var name = root.TryGetProperty("name", out var n) ? n.GetString() : null;

        return new GooglePayload(
            sub,
            string.IsNullOrWhiteSpace(email) ? null : email.ToLowerInvariant(),
            name);
    }

    private CustomerAuthResponseDto BuildResponse(Customer customer)
    {
        var expiresAt = DateTime.UtcNow.AddDays(CustomerTokenDays);
        var token = GenerateToken(customer, expiresAt);
        return new CustomerAuthResponseDto(token, expiresAt, ToProfile(customer));
    }

    private static CustomerProfileDto ToProfile(Customer c) =>
        new(c.Id, c.FullName, c.Email, c.Phone, c.LoyaltyPoints);

    private string GenerateToken(Customer customer, DateTime expiresAt)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, customer.Id.ToString()),
            new(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new(ClaimTypes.Name, customer.FullName),
            new(ClaimTypes.Role, AppRoles.Customer),
        };
        if (customer.Email is not null)
            claims.Add(new Claim(ClaimTypes.Email, customer.Email));

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

    private sealed record GooglePayload(string Sub, string? Email, string? Name);
}

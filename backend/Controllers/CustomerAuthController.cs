using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common.Authorization;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Api.Controllers;

[ApiController]
[Route("api/customer")]
[Produces("application/json")]
[EnableRateLimiting("general")]
public class CustomerAuthController(ICustomerAuthService customerAuthService) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(CustomerAuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] CustomerRegisterDto dto, CancellationToken cancellationToken) =>
        Ok(await customerAuthService.RegisterAsync(dto, cancellationToken));

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(CustomerAuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] CustomerLoginDto dto, CancellationToken cancellationToken)
    {
        var result = await customerAuthService.LoginAsync(dto, cancellationToken);
        return result is null ? Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu." }) : Ok(result);
    }

    [HttpPost("google")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [ProducesResponseType(typeof(CustomerAuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Google([FromBody] GoogleLoginDto dto, CancellationToken cancellationToken)
    {
        var result = await customerAuthService.GoogleLoginAsync(dto, cancellationToken);
        return result is null ? Unauthorized(new { message = "Đăng nhập Google thất bại." }) : Ok(result);
    }

    [HttpGet("me")]
    [Authorize(Roles = AppRoles.Customer)]
    [ProducesResponseType(typeof(CustomerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(id, out var customerId))
            return Unauthorized();

        var profile = await customerAuthService.GetProfileAsync(customerId, cancellationToken);
        return profile is null ? Unauthorized() : Ok(profile);
    }
}

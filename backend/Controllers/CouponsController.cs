using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.Common.Authorization;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Api.Controllers;

[ApiController]
[Route("api/coupons")]
[Produces("application/json")]
public class CouponsController(ICouponService couponService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CouponDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<CouponDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await couponService.GetAllAsync(pagination, cancellationToken));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CouponDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CouponDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await couponService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Roles = AppRoles.ManageCoupons)]
    [ProducesResponseType(typeof(CouponDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CouponDto>> Create(
        [FromBody] CreateCouponDto dto,
        CancellationToken cancellationToken)
    {
        var coupon = await couponService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = coupon.Id }, coupon);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AppRoles.ManageCoupons)]
    [ProducesResponseType(typeof(CouponDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CouponDto>> Update(
        int id,
        [FromBody] UpdateCouponDto dto,
        CancellationToken cancellationToken) =>
        Ok(await couponService.UpdateAsync(id, dto, cancellationToken));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.ManageCoupons)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await couponService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>Kiểm tra mã giảm giá và tính số tiền được giảm (public — khách gọi)</summary>
    [HttpPost("validate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ValidateCouponResultDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ValidateCouponResultDto>> Validate(
        [FromBody] ValidateCouponDto dto,
        CancellationToken cancellationToken) =>
        Ok(await couponService.ValidateAsync(dto, cancellationToken));
}

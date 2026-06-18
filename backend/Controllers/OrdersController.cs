using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.Common.Authorization;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Produces("application/json")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    /// <summary>Tạo đơn hàng mới (public — khách hàng gọi)</summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CreateOrderResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateOrderResultDto>> Create(
        [FromBody] CreateOrderDto dto,
        CancellationToken cancellationToken)
    {
        // Nếu khách đã đăng nhập (gửi kèm token), gắn đơn vào tài khoản.
        int? customerId = null;
        if (User.IsInRole(AppRoles.Customer) &&
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var cid))
            customerId = cid;

        var clientIp = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
        var result = await orderService.CreateAsync(dto, customerId, clientIp, cancellationToken);
        return CreatedAtAction(nameof(GetPublic), new { id = result.Order.Id }, result);
    }

    /// <summary>Tra cứu trạng thái đơn (public, sau thanh toán).</summary>
    [HttpGet("{id:int}/public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OrderPublicDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderPublicDto>> GetPublic(int id, CancellationToken cancellationToken)
    {
        var order = await orderService.GetPublicAsync(id, cancellationToken);
        return order is null ? NotFound() : Ok(order);
    }

    /// <summary>Lịch sử đơn hàng của khách đang đăng nhập</summary>
    [HttpGet("my")]
    [Authorize(Roles = AppRoles.Customer)]
    [ProducesResponseType(typeof(IReadOnlyList<OrderDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> MyOrders(CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
            return Unauthorized();
        return Ok(await orderService.GetMyOrdersAsync(customerId, cancellationToken));
    }

    /// <summary>Lấy danh sách đơn hàng (admin)</summary>
    [HttpGet]
    [Authorize(Roles = AppRoles.ViewOrders)]
    [ProducesResponseType(typeof(PagedResult<OrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<OrderDto>>> GetAll(
        [FromQuery] OrderQuery query,
        CancellationToken cancellationToken) =>
        Ok(await orderService.GetAllAsync(query, cancellationToken));

    /// <summary>Lấy chi tiết đơn hàng (admin)</summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = AppRoles.ViewOrders)]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await orderService.GetByIdAsync(id, cancellationToken));

    /// <summary>Cập nhật trạng thái đơn hàng (admin)</summary>
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = AppRoles.ManageOrders)]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDto>> UpdateStatus(
        int id,
        [FromBody] UpdateOrderStatusDto dto,
        CancellationToken cancellationToken) =>
        Ok(await orderService.UpdateStatusAsync(id, dto, cancellationToken));
}

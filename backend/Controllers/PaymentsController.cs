using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Infrastructure.Configuration;

namespace PhuKienTuiLoc.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController(
    IPaymentService paymentService,
    IOptions<SiteSettings> siteOptions) : ControllerBase
{
    private readonly SiteSettings _site = siteOptions.Value;

    /// <summary>Return URL sau khi khách thanh toán VNPay (redirect trình duyệt).</summary>
    [HttpGet("vnpay/return")]
    [AllowAnonymous]
    public async Task<IActionResult> VnPayReturn(CancellationToken cancellationToken)
    {
        var query = Request.Query.ToDictionary(q => q.Key, q => q.Value.ToString());
        var (orderId, success, message) = await paymentService.ProcessVnPayReturnAsync(query, cancellationToken);
        return Redirect(BuildFrontendResultUrl(orderId, success, message));
    }

    /// <summary>IPN VNPay (server-to-server).</summary>
    [HttpGet("vnpay/ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> VnPayIpn(CancellationToken cancellationToken)
    {
        var query = Request.Query.ToDictionary(q => q.Key, q => q.Value.ToString());
        var (success, responseCode) = await paymentService.ProcessVnPayIpnAsync(query, cancellationToken);
        return Ok(new { RspCode = success ? responseCode : "97", Message = success ? "Confirm Success" : "Invalid Signature" });
    }

    /// <summary>Return URL sau khi khách thanh toán Momo.</summary>
    [HttpGet("momo/return")]
    [AllowAnonymous]
    public async Task<IActionResult> MomoReturn(CancellationToken cancellationToken)
    {
        var query = Request.Query.ToDictionary(q => q.Key, q => q.Value.ToString());
        var (orderId, success, message) = await paymentService.ProcessMomoReturnAsync(query, cancellationToken);
        return Redirect(BuildFrontendResultUrl(orderId, success, message));
    }

    /// <summary>IPN Momo (server-to-server).</summary>
    [HttpPost("momo/ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> MomoIpn(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync(cancellationToken);
        await paymentService.ProcessMomoIpnAsync(body, cancellationToken);
        return Ok(new { resultCode = 0, message = "Success" });
    }

    private string BuildFrontendResultUrl(int orderId, bool success, string message)
    {
        var baseUrl = _site.FrontendUrl.TrimEnd('/');
        var encodedMessage = Uri.EscapeDataString(message);
        return $"{baseUrl}/dat-hang/ket-qua?orderId={orderId}&success={(success ? "1" : "0")}&message={encodedMessage}";
    }
}

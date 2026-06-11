using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common.Authorization;

namespace PhuKienTuiLoc.Api.Controllers;

[ApiController]
[Route("api/uploads")]
[Produces("application/json")]
public class UploadsController(IFileStorageService fileStorageService) : ControllerBase
{
    [HttpPost("images")]
    [Authorize(Roles = AppRoles.UploadImages)]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null)
            return BadRequest(new { title = "No file provided." });

        var path = await fileStorageService.SaveImageAsync(file, cancellationToken);
        var url = $"{Request.Scheme}://{Request.Host}{path}";
        return Ok(new UploadResponse(url, path));
    }

    public record UploadResponse(string Url, string Path);
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;
using PhuKienTuiLoc.Application.Common.Authorization;
using PhuKienTuiLoc.Application.DTOs;

namespace PhuKienTuiLoc.Api.Controllers;

[ApiController]
[Route("api/news-articles")]
[Produces("application/json")]
public class NewsArticlesController(INewsArticleService newsArticleService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<NewsArticleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<NewsArticleDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await newsArticleService.GetAllAsync(pagination, cancellationToken));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NewsArticleDto>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await newsArticleService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Roles = AppRoles.ManageNews)]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<NewsArticleDto>> Create(
        [FromBody] CreateNewsArticleDto dto,
        CancellationToken cancellationToken)
    {
        var article = await newsArticleService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = article.Id }, article);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AppRoles.ManageNews)]
    [ProducesResponseType(typeof(NewsArticleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<NewsArticleDto>> Update(
        int id,
        [FromBody] UpdateNewsArticleDto dto,
        CancellationToken cancellationToken) =>
        Ok(await newsArticleService.UpdateAsync(id, dto, cancellationToken));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.ManageNews)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await newsArticleService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

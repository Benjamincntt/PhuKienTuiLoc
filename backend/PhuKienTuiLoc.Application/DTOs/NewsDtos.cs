namespace PhuKienTuiLoc.Application.DTOs;

public record NewsArticleDto(int Id, string Title, string Excerpt, string ImageUrl, DateTime PublishedAt);

public class CreateNewsArticleDto
{
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime? PublishedAt { get; set; }
}

public class UpdateNewsArticleDto
{
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
}

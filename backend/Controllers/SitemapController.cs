using System.Text;
using Microsoft.AspNetCore.Mvc;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Common;

namespace PhuKienTuiLoc.Api.Controllers;

[ApiController]
public class SitemapController(
    IProductService productService,
    ICategoryService categoryService,
    INewsArticleService newsArticleService,
    IConfiguration configuration) : ControllerBase
{
    private string BaseUrl =>
        (configuration["Site:BaseUrl"] ?? "https://baobiantea.com").TrimEnd('/');

    [HttpGet("/sitemap.xml")]
    [HttpGet("/api/sitemap.xml")]
    [Produces("application/xml")]
    public async Task<IActionResult> GetSitemap(CancellationToken cancellationToken)
    {
        var products = await productService.GetAllAsync(new ProductQuery { Page = 1, PageSize = 1000 }, cancellationToken);
        var categories = await categoryService.GetAllAsync(new CategoryQuery { Page = 1, PageSize = 1000 }, cancellationToken);
        var news = await newsArticleService.GetAllAsync(new PaginationQuery { Page = 1, PageSize = 1000 }, cancellationToken);

        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

        AppendUrl(sb, BaseUrl + "/", today, "daily", "1.0");
        AppendUrl(sb, BaseUrl + "/products", today, "daily", "0.9");

        foreach (var category in categories.Items)
            AppendUrl(sb, $"{BaseUrl}/products?category={Escape(category.Slug)}", today, "weekly", "0.8");

        foreach (var product in products.Items)
            AppendUrl(sb, $"{BaseUrl}/products/{Escape(product.Slug)}", today, "weekly", "0.7");

        foreach (var article in news.Items)
            AppendUrl(sb, $"{BaseUrl}/news/{article.Id}", article.PublishedAt.ToString("yyyy-MM-dd"), "monthly", "0.5");

        sb.AppendLine("</urlset>");

        return Content(sb.ToString(), "application/xml", Encoding.UTF8);
    }

    private static void AppendUrl(StringBuilder sb, string loc, string lastmod, string changefreq, string priority)
    {
        sb.AppendLine("  <url>");
        sb.AppendLine($"    <loc>{loc}</loc>");
        sb.AppendLine($"    <lastmod>{lastmod}</lastmod>");
        sb.AppendLine($"    <changefreq>{changefreq}</changefreq>");
        sb.AppendLine($"    <priority>{priority}</priority>");
        sb.AppendLine("  </url>");
    }

    private static string Escape(string value) =>
        value.Replace("&", "&amp;")
             .Replace("<", "&lt;")
             .Replace(">", "&gt;")
             .Replace("\"", "&quot;")
             .Replace("'", "&apos;");
}

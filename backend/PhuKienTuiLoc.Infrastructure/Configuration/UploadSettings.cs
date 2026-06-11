namespace PhuKienTuiLoc.Infrastructure.Configuration;

public class UploadSettings
{
    public string ImagesPath { get; set; } = "uploads/images";
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
}

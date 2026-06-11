using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Domain.Exceptions;
using PhuKienTuiLoc.Infrastructure.Configuration;

namespace PhuKienTuiLoc.Infrastructure.Files;

public class FileStorageService(IOptions<UploadSettings> options, IWebHostEnvironment env) : IFileStorageService
{
    private readonly UploadSettings _settings = options.Value;

    public async Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length == 0)
            throw new ValidationException("File is empty.");

        if (file.Length > _settings.MaxFileSizeBytes)
            throw new ValidationException($"File exceeds max size of {_settings.MaxFileSizeBytes / 1024 / 1024} MB.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_settings.AllowedExtensions.Contains(extension))
            throw new ValidationException($"File type '{extension}' is not allowed.");

        var dir = Path.Combine(env.WebRootPath, _settings.ImagesPath);
        Directory.CreateDirectory(dir);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(dir, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream, cancellationToken);

        return $"/{_settings.ImagesPath.Replace('\\', '/')}/{fileName}";
    }
}

using Microsoft.AspNetCore.Http;

namespace PhuKienTuiLoc.Application.Abstractions.Services;

public interface IFileStorageService
{
    Task<string> SaveImageAsync(IFormFile file, CancellationToken cancellationToken = default);
}

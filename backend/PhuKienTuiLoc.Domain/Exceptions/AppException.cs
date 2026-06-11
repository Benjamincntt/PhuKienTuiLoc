namespace PhuKienTuiLoc.Domain.Exceptions;

public abstract class AppException : Exception
{
    protected AppException(string title, string detail, int statusCode) : base(detail)
    {
        Title = title;
        StatusCode = statusCode;
    }

    public string Title { get; }
    public int StatusCode { get; }
}

public sealed class NotFoundException(string detail)
    : AppException("Not Found", detail, StatusCodes.Status404NotFound);

public sealed class ConflictException(string title, string detail)
    : AppException(title, detail, StatusCodes.Status409Conflict);

public sealed class ValidationException(string detail)
    : AppException("Bad Request", detail, StatusCodes.Status400BadRequest);

file static class StatusCodes
{
    public const int Status400BadRequest = 400;
    public const int Status404NotFound = 404;
    public const int Status409Conflict = 409;
}

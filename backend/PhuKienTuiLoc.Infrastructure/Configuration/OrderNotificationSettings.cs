namespace PhuKienTuiLoc.Infrastructure.Configuration;

public class OrderNotificationSettings
{
    public bool Enabled { get; set; } = true;

    /// <summary>Email nhận thông báo đơn hàng mới.</summary>
    public string RecipientEmail { get; set; } = string.Empty;
}

public class SmtpSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public bool UseStartTls { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "AnTea";
}

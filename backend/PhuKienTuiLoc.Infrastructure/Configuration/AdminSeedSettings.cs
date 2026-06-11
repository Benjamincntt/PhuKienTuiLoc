namespace PhuKienTuiLoc.Infrastructure.Configuration;

public class AdminSeedSettings
{
    public List<SeedUser> Users { get; set; } = [];
}

public class SeedUser
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin";
}

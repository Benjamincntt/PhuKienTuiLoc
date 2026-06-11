namespace PhuKienTuiLoc.Application.Common.Authorization;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Accountant = "Accountant";
    public const string Employee = "Employee";

    public const string AllStaff = $"{Admin},{Accountant},{Employee}";
    public const string ManageCategories = Admin;
    public const string ManageProducts = $"{Admin},{Employee}";
    public const string ManageCoupons = $"{Admin},{Accountant}";
    public const string ManageNews = $"{Admin},{Employee}";
    public const string UploadImages = $"{Admin},{Employee}";
}

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using PhuKienTuiLoc.Application.Abstractions.Persistence;
using PhuKienTuiLoc.Application.Abstractions.Services;
using PhuKienTuiLoc.Application.Configuration;
using PhuKienTuiLoc.Infrastructure.Auth;
using PhuKienTuiLoc.Infrastructure.Configuration;
using PhuKienTuiLoc.Infrastructure.Files;
using PhuKienTuiLoc.Infrastructure.Notifications;
using PhuKienTuiLoc.Infrastructure.Payments;
using PhuKienTuiLoc.Infrastructure.Persistence;
using PhuKienTuiLoc.Infrastructure.Persistence.Repositories;
using PhuKienTuiLoc.Infrastructure.Seeders;

namespace PhuKienTuiLoc.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.Configure<AdminSeedSettings>(configuration.GetSection("Admin"));
        services.Configure<UploadSettings>(configuration.GetSection("Upload"));
        services.Configure<GoogleAuthSettings>(configuration.GetSection("Google"));
        services.Configure<SiteSettings>(configuration.GetSection("Site"));
        services.Configure<VnPaySettings>(configuration.GetSection("VnPay"));
        services.Configure<MomoSettings>(configuration.GetSection("Momo"));
        services.Configure<PaymentFeatureSettings>(configuration.GetSection("Payments"));
        services.Configure<OrderNotificationSettings>(configuration.GetSection("OrderNotification"));
        services.Configure<SmtpSettings>(configuration.GetSection("Smtp"));

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddHttpClient();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICustomerAuthService, CustomerAuthService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IOrderNotificationService, OrderEmailNotificationService>();
        services.AddScoped<IFileStorageService, FileStorageService>();

        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()
            ?? throw new InvalidOperationException("Jwt settings are not configured.");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                };
            });

        return services;
    }

    public static async Task MigrateAndSeedAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var adminOptions = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<AdminSeedSettings>>();

        await db.Database.MigrateAsync();
        await DataSeeder.SeedAsync(db);
        await AdminSeeder.SeedAsync(db, adminOptions);
    }
}

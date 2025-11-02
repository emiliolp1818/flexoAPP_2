using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.Enums;
using System.Text.Json;

namespace FlexoAPP.API.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();
            
            try
            {
                Console.WriteLine("🔄 Initializing database...");
                
                // Ensure database is created
                await context.Database.EnsureCreatedAsync();
                Console.WriteLine("✅ Database created/verified");
                
                // Check if we already have users
                var userCount = await context.Users.CountAsync();
                Console.WriteLine($"📊 Current user count: {userCount}");
                
                if (userCount > 0)
                {
                    // Check if admin user exists and is active
                    var adminUser = await context.Users
                        .FirstOrDefaultAsync(u => u.UserCode == "admin");
                    
                    if (adminUser != null)
                    {
                        Console.WriteLine($"👤 Admin user found - ID: {adminUser.Id}, Active: {adminUser.IsActive}");
                        
                        // Always reset the admin password to ensure it works
                        Console.WriteLine("🔄 Resetting admin password...");
                        adminUser.Password = BCrypt.Net.BCrypt.HashPassword("admin123");
                        adminUser.IsActive = true;
                        adminUser.UpdatedAt = DateTime.UtcNow;
                        await context.SaveChangesAsync();
                        Console.WriteLine("✅ Admin password reset successfully");
                    }
                    else
                    {
                        Console.WriteLine("⚠️ Admin user not found, creating...");
                        await CreateAdminUser(context);
                    }
                    
                    return;
                }
                
                // Create default admin user
                await CreateAdminUser(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error initializing data: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                // Don't throw - let the app continue even if seeding fails
            }
        }
        
        private static async Task CreateAdminUser(FlexoAPPDbContext context)
        {
            var adminUser = new User
            {
                UserCode = "admin",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FirstName = "Administrador",
                LastName = "del Sistema",
                Role = UserRole.Admin,
                Permissions = JsonSerializer.Serialize(new List<string> 
                { 
                    "read", "write", "delete", "admin" 
                }),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            
            Console.WriteLine("✅ Admin user created successfully");
            Console.WriteLine("   Username: admin");
            Console.WriteLine("   Password: admin123");
            Console.WriteLine($"   ID: {adminUser.Id}");
            Console.WriteLine($"   Active: {adminUser.IsActive}");
        }


    }
}
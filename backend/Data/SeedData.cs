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
                Console.WriteLine("🔄 Inicializando base de datos...");


                await context.Database.EnsureCreatedAsync();
                Console.WriteLine("✅ Base de datos creada/verificada");


                var userCount = await context.Users.CountAsync();
                Console.WriteLine($"📊 Usuarios actuales en el sistema: {userCount}");

                if (userCount > 0)
                {

                    var adminUser = await context.Users
                        .FirstOrDefaultAsync(u => u.UserCode == "admin");

                    if (adminUser != null)
                    {
                        Console.WriteLine($"👤 Usuario administrador encontrado - ID: {adminUser.Id}, Activo: {adminUser.IsActive}");


                        Console.WriteLine("🔄 Actualizando contraseña del administrador...");
                        adminUser.Password = BCrypt.Net.BCrypt.HashPassword("admin123");
                        adminUser.IsActive = true;
                        adminUser.UpdatedAt = DateTime.UtcNow;
                        await context.SaveChangesAsync();
                        Console.WriteLine("✅ Contraseña del administrador actualizada");
                    }
                    else
                    {
                        Console.WriteLine("⚠️ Usuario administrador no encontrado, creando...");
                        await CreateAdminUser(context);
                    }

                    return;
                }


                await CreateAdminUser(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error inicializando datos: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

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
                    "read",
                    "write",
                    "delete",
                    "admin"
                }),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };


            context.Users.Add(adminUser);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Usuario administrador creado exitosamente");
            Console.WriteLine("   Usuario: admin");
            Console.WriteLine("   Contraseña: admin123");
            Console.WriteLine($"   ID: {adminUser.Id}");
            Console.WriteLine($"   Activo: {adminUser.IsActive}");
        }
    }
}
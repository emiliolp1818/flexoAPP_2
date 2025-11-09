using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.Enums;
using System.Text.Json;

namespace FlexoAPP.API.Data
{
    /// <summary>
    /// Clase para inicializar datos básicos del sistema FlexoAPP
    /// Crea únicamente el usuario administrador necesario para el funcionamiento del sistema
    /// </summary>
    public static class SeedData
    {
        /// <summary>
        /// Inicializa la base de datos con los datos mínimos necesarios
        /// Solo crea el usuario administrador si no existe
        /// </summary>
        /// <param name="serviceProvider">Proveedor de servicios para acceso al contexto de base de datos</param>
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            // Crear scope para acceso a servicios con inyección de dependencias
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<FlexoAPPDbContext>();
            
            try
            {
                Console.WriteLine("🔄 Inicializando base de datos...");
                
                // Asegurar que la base de datos existe
                await context.Database.EnsureCreatedAsync();
                Console.WriteLine("✅ Base de datos creada/verificada");
                
                // Verificar si ya existen usuarios en el sistema
                var userCount = await context.Users.CountAsync();
                Console.WriteLine($"📊 Usuarios actuales en el sistema: {userCount}");
                
                if (userCount > 0)
                {
                    // Verificar si el usuario administrador existe y está activo
                    var adminUser = await context.Users
                        .FirstOrDefaultAsync(u => u.UserCode == "admin");
                    
                    if (adminUser != null)
                    {
                        Console.WriteLine($"👤 Usuario administrador encontrado - ID: {adminUser.Id}, Activo: {adminUser.IsActive}");
                        
                        // Resetear contraseña del administrador para asegurar acceso
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
                
                // Crear usuario administrador por defecto
                await CreateAdminUser(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error inicializando datos: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                // No lanzar excepción - permitir que la aplicación continúe aunque falle la inicialización
            }
        }
        
        /// <summary>
        /// Crea el usuario administrador por defecto del sistema
        /// </summary>
        /// <param name="context">Contexto de base de datos para operaciones</param>
        private static async Task CreateAdminUser(FlexoAPPDbContext context)
        {
            // Crear usuario administrador con permisos completos
            var adminUser = new User
            {
                UserCode = "admin",                                    // Código de usuario para login
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"), // Contraseña encriptada con BCrypt
                FirstName = "Administrador",                           // Nombre del usuario
                LastName = "del Sistema",                              // Apellido del usuario
                Role = UserRole.Admin,                                 // Rol de administrador con permisos completos
                Permissions = JsonSerializer.Serialize(new List<string> 
                { 
                    "read",    // Permiso de lectura
                    "write",   // Permiso de escritura
                    "delete",  // Permiso de eliminación
                    "admin"    // Permiso de administración
                }),
                IsActive = true,                                       // Usuario activo
                CreatedAt = DateTime.UtcNow,                          // Fecha de creación
                UpdatedAt = DateTime.UtcNow                           // Fecha de última actualización
            };
            
            // Agregar usuario a la base de datos
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
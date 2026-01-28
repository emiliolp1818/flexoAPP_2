using Microsoft.AspNetCore.Mvc;                    // Para usar ControllerBase, IActionResult, etc.
using Microsoft.AspNetCore.Authorization;          // Para usar [Authorize], [AllowAnonymous]
using FlexoAPP.API.Services;                       // Para acceder a los servicios de la aplicación
using FlexoAPP.API.Repositories;                   // Para acceder a los repositorios
using flexoAPP.Repositories;                       // Para acceder a IMaquinaRepository
using System.Linq;                                 // Para usar LINQ (consultas)
using FlexoAPP.API.Data.Context;                   // Para acceder al DbContext
using Microsoft.EntityFrameworkCore;               // Para usar LINQ con EF Core

namespace FlexoAPP.API.Controllers
{
    /// <summary>
    /// Controlador para las estadísticas del dashboard
    /// Proporciona datos agregados de usuarios, órdenes, diseños y tiempos
    /// </summary>
    [ApiController]                                // Marca esta clase como controlador de API
    [Route("api/[controller]")]                    // Ruta base: /api/dashboard
    [AllowAnonymous]                               // Permitir acceso sin autenticación (temporal)
    public class DashboardController : ControllerBase
    {
        // Repositorios inyectados para acceder a los datos
        private readonly IUserRepository _userRepository;              // Repositorio de usuarios
        private readonly IDesignRepository _designRepository;          // Repositorio de diseños
        private readonly IMaquinaRepository _maquinaRepository;        // Repositorio de máquinas
        private readonly FlexoAPPDbContext _context;                   // DbContext para consultas avanzadas

        /// <summary>
        /// Constructor con inyección de dependencias
        /// </summary>
        public DashboardController(
            IUserRepository userRepository,
            IDesignRepository designRepository,
            IMaquinaRepository maquinaRepository,
            FlexoAPPDbContext context)
        {
            _userRepository = userRepository;                          // Asignar repositorio de usuarios
            _designRepository = designRepository;                      // Asignar repositorio de diseños
            _maquinaRepository = maquinaRepository;                    // Asignar repositorio de máquinas
            _context = context;                                        // Asignar DbContext
        }

        /// <summary>
        /// Obtener estadísticas generales del dashboard
        /// GET /api/dashboard/stats
        /// </summary>
        [HttpGet("stats")]                                             // Ruta: GET /api/dashboard/stats
        public async Task<IActionResult> GetDashboardStats()
        {
            // Inicializar variables con valores por defecto
            int totalUsers = 0;
            int newUsersThisMonth = 0;
            int totalDesigns = 0;
            int newDesignsThisWeek = 0;
            int readyOrders = 0;
            int readyToday = 0;
            double averageSetupTime = 0;
            int totalSetupChanges = 0;

            try
            {
                // 1. USUARIOS TOTALES Y NUEVOS
                try
                {
                    var allUsers = await _userRepository.GetAllAsync();    // Obtener todos los usuarios
                    totalUsers = allUsers.Count();                         // Contar usuarios totales (con paréntesis)
                    
                    var firstDayOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    newUsersThisMonth = allUsers.Count(u => u.CreatedAt >= firstDayOfMonth);
                    
                    Console.WriteLine($"✅ Usuarios: {totalUsers} totales, {newUsersThisMonth} nuevos este mes");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error obteniendo usuarios: {ex.Message}");
                }

                // 2. DISEÑOS TOTALES Y NUEVOS
                try
                {
                    var allDesigns = await _designRepository.GetAllDesignsAsync(); // Método correcto
                    totalDesigns = allDesigns.Count();                     // Contar diseños totales (con paréntesis)
                    
                    // La entidad Design no tiene CreatedAt, por ahora no podemos filtrar por fecha
                    newDesignsThisWeek = 0;                                // Establecer en 0 hasta que se agregue CreatedAt
                    
                    Console.WriteLine($"✅ Diseños: {totalDesigns} totales");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error obteniendo diseños: {ex.Message}");
                }

                // 3. ÓRDENES LISTAS Y TIEMPOS (desde tabla maquinas)
                try
                {
                    var allMaquinas = await _maquinaRepository.GetAllAsync();
                    
                    // Contar máquinas en estado "Listo" (case insensitive)
                    readyOrders = allMaquinas.Count(m => 
                        m.Estado.Equals("Listo", StringComparison.OrdinalIgnoreCase) ||
                        m.Estado.Equals("LISTO", StringComparison.OrdinalIgnoreCase));
                    
                    var today = DateTime.Today;
                    // Contar máquinas que cambiaron a "Listo" hoy
                    readyToday = allMaquinas.Count(m =>
                        (m.Estado.Equals("Listo", StringComparison.OrdinalIgnoreCase) ||
                         m.Estado.Equals("LISTO", StringComparison.OrdinalIgnoreCase)) &&
                        m.UpdatedAt.Date == today);
                    
                    Console.WriteLine($"✅ Órdenes: {readyOrders} listas, {readyToday} hoy");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error obteniendo máquinas: {ex.Message}");
                }

                // 4. TIEMPO PROMEDIO DE PREPARACIÓN (desde Activities con Duration)
                try
                {
                    // Obtener actividades de máquinas con duración (PREPARANDO -> LISTO)
                    var machineActivities = await _context.Activities
                        .Where(a => 
                            a.Module == "MACHINES" && 
                            a.Action == "MACHINE_STATUS_CHANGED" &&
                            a.Duration != null &&
                            a.Duration.Value.TotalMinutes > 0 &&
                            a.Description.Contains("PREPARANDO") &&
                            a.Description.Contains("LISTO"))
                        .ToListAsync();

                    if (machineActivities.Any())
                    {
                        // Calcular promedio en minutos
                        averageSetupTime = machineActivities.Average(a => a.Duration!.Value.TotalMinutes);
                        totalSetupChanges = machineActivities.Count;
                        
                        Console.WriteLine($"✅ Tiempo promedio: {Math.Round(averageSetupTime, 1)} min de {totalSetupChanges} cambios");
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ No hay actividades con duración registradas");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error calculando tiempo promedio: {ex.Message}");
                }

                // Crear objeto con las estadísticas calculadas
                var stats = new
                {
                    totalUsers,
                    newUsersThisMonth,
                    readyOrders,
                    readyToday,
                    totalDesigns,
                    newDesignsThisWeek,
                    averageSetupTime = Math.Round(averageSetupTime, 1),
                    totalSetupChanges
                };

                Console.WriteLine($"📊 Dashboard Stats completo: Users={totalUsers}, Ready={readyOrders}, Designs={totalDesigns}");

                return Ok(stats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error general en GetDashboardStats: {ex.Message}");
                
                // Devolver estadísticas con valores por defecto en caso de error
                return Ok(new
                {
                    totalUsers,
                    newUsersThisMonth,
                    readyOrders,
                    readyToday,
                    totalDesigns,
                    newDesignsThisWeek,
                    averageSetupTime,
                    totalSetupChanges
                });
            }
        }

        /// <summary>
        /// Obtener tiempo promedio de preparación por usuario
        /// GET /api/dashboard/average-time-by-user
        /// </summary>
        [HttpGet("average-time-by-user")]
        public async Task<IActionResult> GetAverageTimeByUser()
        {
            try
            {
                // Obtener actividades de máquinas con duración agrupadas por usuario
                var userAverages = await _context.Activities
                    .Include(a => a.User) // Incluir navegación a User
                    .Where(a => 
                        a.Module == "MACHINES" && 
                        a.Action == "MACHINE_STATUS_CHANGED" &&
                        a.Duration != null &&
                        a.Duration.Value.TotalMinutes > 0 &&
                        a.Description.Contains("PREPARANDO") &&
                        a.Description.Contains("LISTO") &&
                        a.UserId > 0)
                    .GroupBy(a => new { a.UserId, a.UserCode })
                    .Select(g => new
                    {
                        userId = g.Key.UserId,
                        userCode = g.Key.UserCode,
                        userName = g.First().User != null ? g.First().User.FirstName + " " + g.First().User.LastName : g.Key.UserCode,
                        averageTime = g.Average(a => a.Duration!.Value.TotalMinutes),
                        totalChanges = g.Count(),
                        minTime = g.Min(a => a.Duration!.Value.TotalMinutes),
                        maxTime = g.Max(a => a.Duration!.Value.TotalMinutes)
                    })
                    .OrderBy(u => u.averageTime)
                    .ToListAsync();

                Console.WriteLine($"📊 Tiempos promedio por usuario: {userAverages.Count} usuarios");

                return Ok(userAverages);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error obteniendo tiempos por usuario: {ex.Message}");
                return Ok(new List<object>());
            }
        }
    }
}

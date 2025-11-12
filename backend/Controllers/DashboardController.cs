using Microsoft.AspNetCore.Mvc;                    // Para usar ControllerBase, IActionResult, etc.
using Microsoft.AspNetCore.Authorization;          // Para usar [Authorize], [AllowAnonymous]
using FlexoAPP.API.Services;                       // Para acceder a los servicios de la aplicación
using FlexoAPP.API.Repositories;                   // Para acceder a los repositorios
using System.Linq;                                 // Para usar LINQ (consultas)

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

        /// <summary>
        /// Constructor con inyección de dependencias
        /// </summary>
        public DashboardController(
            IUserRepository userRepository,
            IDesignRepository designRepository,
            IMaquinaRepository maquinaRepository)
        {
            _userRepository = userRepository;                          // Asignar repositorio de usuarios
            _designRepository = designRepository;                      // Asignar repositorio de diseños
            _maquinaRepository = maquinaRepository;                    // Asignar repositorio de máquinas
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
                    
                    // Calcular tiempo promedio de preparación (de CreatedAt a cuando cambió a Listo)
                    // Asumimos que las máquinas en estado "Listo" pasaron por preparación
                    var maquinasListas = allMaquinas.Where(m =>
                        (m.Estado.Equals("Listo", StringComparison.OrdinalIgnoreCase) ||
                         m.Estado.Equals("LISTO", StringComparison.OrdinalIgnoreCase)) &&
                        m.CreatedAt != default &&
                        m.UpdatedAt != default &&
                        m.UpdatedAt > m.CreatedAt
                    ).ToList();

                    if (maquinasListas.Any())
                    {
                        averageSetupTime = maquinasListas.Average(m =>
                            (m.UpdatedAt - m.CreatedAt).TotalMinutes);
                    }

                    totalSetupChanges = maquinasListas.Count;
                    
                    Console.WriteLine($"✅ Órdenes: {readyOrders} listas, {readyToday} hoy, {Math.Round(averageSetupTime, 1)}min promedio, {totalSetupChanges} cambios");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error obteniendo máquinas: {ex.Message}");
                    Console.WriteLine($"⚠️ Stack trace: {ex.StackTrace}");
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
    }
}

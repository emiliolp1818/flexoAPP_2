using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Repositories;
using flexoAPP.Repositories;
using System.Linq;
using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace FlexoAPP.API.Controllers
{




    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class DashboardController : ControllerBase
    {

        private readonly IUserRepository _userRepository;
        private readonly IDesignRepository _designRepository;
        private readonly IMaquinaRepository _maquinaRepository;
        private readonly FlexoAPPDbContext _context;




        public DashboardController(
            IUserRepository userRepository,
            IDesignRepository designRepository,
            IMaquinaRepository maquinaRepository,
            FlexoAPPDbContext context)
        {
            _userRepository = userRepository;
            _designRepository = designRepository;
            _maquinaRepository = maquinaRepository;
            _context = context;
        }





        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {

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

                try
                {
                    var allUsers = await _userRepository.GetAllAsync();
                    totalUsers = allUsers.Count();

                    var firstDayOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    newUsersThisMonth = allUsers.Count(u => u.CreatedAt >= firstDayOfMonth);

                    Console.WriteLine($"✅ Usuarios: {totalUsers} totales, {newUsersThisMonth} nuevos este mes");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error obteniendo usuarios: {ex.Message}");
                }


                try
                {
                    var allDesigns = await _designRepository.GetAllDesignsAsync();
                    totalDesigns = allDesigns.Count();


                    newDesignsThisWeek = 0;

                    Console.WriteLine($"✅ Diseños: {totalDesigns} totales");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error obteniendo diseños: {ex.Message}");
                }


                try
                {
                    var allMaquinas = await _maquinaRepository.GetAllAsync();


                    readyOrders = allMaquinas.Count(m =>
                        !string.IsNullOrEmpty(m.Estado) &&
                        (m.Estado.Equals("Listo", StringComparison.OrdinalIgnoreCase) ||
                         m.Estado.Equals("LISTO", StringComparison.OrdinalIgnoreCase)));

                    var today = DateTime.Today;

                    readyToday = allMaquinas.Count(m =>
                        !string.IsNullOrEmpty(m.Estado) &&
                        (m.Estado.Equals("Listo", StringComparison.OrdinalIgnoreCase) ||
                         m.Estado.Equals("LISTO", StringComparison.OrdinalIgnoreCase)) &&
                        m.UpdatedAt.Date == today);

                    Console.WriteLine($"✅ Órdenes: {readyOrders} listas, {readyToday} hoy");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Error obteniendo máquinas: {ex.Message}");
                }


                try
                {


                    var machineActivities = await _context.Activities
                        .Where(a =>
                            a.Module == "MACHINES" &&
                            a.Action == "MACHINE_STATUS_CHANGED" &&
                            a.Duration != null &&
                            a.Description.Contains("PREPARANDO") &&
                            a.Description.Contains("LISTO"))
                        .ToListAsync();


                    var validActivities = machineActivities
                        .Where(a => a.Duration!.Value.TotalMinutes > 0)
                        .ToList();

                    if (validActivities.Any())
                    {

                        averageSetupTime = validActivities.Average(a => a.Duration!.Value.TotalMinutes);
                        totalSetupChanges = validActivities.Count;

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





        [HttpGet("average-time-by-user")]
        public async Task<IActionResult> GetAverageTimeByUser()
        {
            try
            {


                var activities = await _context.Activities
                    .Include(a => a.User)
                    .Where(a =>
                        a.Module == "MACHINES" &&
                        a.Action == "MACHINE_STATUS_CHANGED" &&
                        a.Duration != null &&
                        a.Description.Contains("PREPARANDO") &&
                        a.Description.Contains("LISTO") &&
                        a.UserId > 0)
                    .ToListAsync();


                var userAverages = activities
                    .Where(a => a.Duration!.Value.TotalMinutes > 0)
                    .GroupBy(a => new { a.UserId, a.UserCode, a.User })
                    .Select(g => new
                    {
                        userId = g.Key.UserId,
                        userCode = g.Key.UserCode,
                        userName = g.Key.User != null ? g.Key.User.FirstName + " " + g.Key.User.LastName : g.Key.UserCode,
                        averageTime = Math.Round(g.Average(a => a.Duration!.Value.TotalMinutes), 1),
                        totalChanges = g.Count(),
                        minTime = Math.Round(g.Min(a => a.Duration!.Value.TotalMinutes), 1),
                        maxTime = Math.Round(g.Max(a => a.Duration!.Value.TotalMinutes), 1)
                    })
                    .OrderBy(u => u.averageTime)
                    .ToList();

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

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using flexoAPP.Services;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IMachineProgramService _machineProgramService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IMachineProgramService machineProgramService,
            ILogger<DashboardController> logger)
        {
            _machineProgramService = machineProgramService;
            _logger = logger;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                // Get machine programs statistics
                var statistics = await _machineProgramService.GetStatisticsAsync();
                
                // Create dashboard stats response
                var dashboardStats = new
                {
                    totalUsers = 25, // Mock data - replace with actual user service call
                    newUsersThisMonth = 3,
                    activeOrders = statistics?.TotalPrograms ?? 0,
                    ordersToday = statistics?.RunningPrograms ?? 0,
                    totalDesigns = 45, // Mock data - replace with actual design service call
                    totalMachines = 11, // Machines 11-21
                    activeMachines = statistics?.ActiveMachines ?? 0,
                    completedOrdersToday = statistics?.CompletedPrograms ?? 0,
                    pendingOrders = statistics?.SuspendedPrograms ?? 0,
                    machineUtilization = CalculateMachineUtilization(statistics),
                    recentActivity = await GetRecentActivity()
                };

                return Ok(new
                {
                    success = true,
                    data = dashboardStats,
                    message = "Estadísticas del dashboard obtenidas exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo estadísticas del dashboard");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        [HttpGet("machine-summary")]
        public async Task<IActionResult> GetMachineSummary()
        {
            try
            {
                var programs = await _machineProgramService.GetAllAsync();
                
                var machineSummary = new List<object>();
                
                // Generate summary for machines 11-21
                for (int machineNumber = 11; machineNumber <= 21; machineNumber++)
                {
                    var machinePrograms = programs.Where(p => p.MachineNumber == machineNumber).ToList();
                    
                    machineSummary.Add(new
                    {
                        machineNumber = machineNumber,
                        totalPrograms = machinePrograms.Count,
                        readyPrograms = machinePrograms.Count(p => p.Estado == "LISTO"),
                        runningPrograms = machinePrograms.Count(p => p.Estado == "CORRIENDO"),
                        suspendedPrograms = machinePrograms.Count(p => p.Estado == "SUSPENDIDO"),
                        completedPrograms = machinePrograms.Count(p => p.Estado == "TERMINADO"),
                        status = GetMachineStatus(machinePrograms),
                        lastActivity = machinePrograms.OrderByDescending(p => p.UpdatedAt).FirstOrDefault()?.UpdatedAt
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = machineSummary,
                    message = "Resumen de máquinas obtenido exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo resumen de máquinas");
                return StatusCode(500, new
                {
                    success = false,
                    error = "Error interno del servidor",
                    message = ex.Message
                });
            }
        }

        private double CalculateMachineUtilization(flexoAPP.Models.DTOs.MachineProgramStatisticsDto? statistics)
        {
            if (statistics == null) return 0.0;
            
            var totalMachines = 11; // Machines 11-21
            var activeMachines = statistics.ActiveMachines;
            
            return totalMachines > 0 ? (double)activeMachines / totalMachines * 100 : 0.0;
        }

        private async Task<List<object>> GetRecentActivity()
        {
            try
            {
                var programs = await _machineProgramService.GetAllAsync();
                
                return programs
                    .OrderByDescending(p => p.UpdatedAt)
                    .Take(10)
                    .Select(p => new
                    {
                        id = p.Id,
                        type = "program_update",
                        description = $"Programa {p.Articulo} - {p.Estado}",
                        machineNumber = p.MachineNumber,
                        timestamp = p.UpdatedAt,
                        user = "Sistema" // Simplified for now
                    })
                    .ToList<object>();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error obteniendo actividad reciente");
                return new List<object>();
            }
        }

        private string GetMachineStatus(List<flexoAPP.Models.DTOs.MachineProgramDto> machinePrograms)
        {
            if (!machinePrograms.Any()) return "IDLE";
            
            if (machinePrograms.Any(p => p.Estado == "CORRIENDO")) return "RUNNING";
            if (machinePrograms.Any(p => p.Estado == "LISTO")) return "READY";
            if (machinePrograms.Any(p => p.Estado == "SUSPENDIDO")) return "SUSPENDED";
            
            return "IDLE";
        }
    }
}
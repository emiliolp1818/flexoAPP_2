using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;

namespace flexoAPP.Repositories
{
    public class MachineProgramRepository : IMachineProgramRepository
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MachineProgramRepository> _logger;

        public MachineProgramRepository(FlexoAPPDbContext context, ILogger<MachineProgramRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<MachineProgram>> GetAllAsync()
        {
            try
            {
                return await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .OrderBy(p => p.MachineNumber)
                    .ThenBy(p => p.FechaInicio)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo todos los programas de máquinas");
                throw;
            }
        }

        public async Task<MachineProgram?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .FirstOrDefaultAsync(p => p.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo programa con ID {id}");
                throw;
            }
        }

        public async Task<IEnumerable<MachineProgram>> GetByMachineNumberAsync(int machineNumber)
        {
            try
            {
                return await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .Where(p => p.MachineNumber == machineNumber)
                    .OrderBy(p => p.FechaInicio)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo programas de máquina {machineNumber}");
                throw;
            }
        }

        public async Task<IEnumerable<MachineProgram>> GetByStatusAsync(string status)
        {
            try
            {
                return await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .Where(p => p.Estado == status)
                    .OrderBy(p => p.MachineNumber)
                    .ThenBy(p => p.FechaInicio)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo programas con estado {status}");
                throw;
            }
        }

        public async Task<MachineProgram> CreateAsync(MachineProgram program)
        {
            try
            {
                program.CreatedAt = DateTime.UtcNow;
                program.UpdatedAt = DateTime.UtcNow;

                _context.MachinePrograms.Add(program);
                await _context.SaveChangesAsync();

                // Recargar con las relaciones
                return await GetByIdAsync(program.Id) ?? program;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creando programa {program.Articulo}");
                throw;
            }
        }

        public async Task<MachineProgram> UpdateAsync(MachineProgram program)
        {
            try
            {
                program.UpdatedAt = DateTime.UtcNow;

                _context.MachinePrograms.Update(program);
                await _context.SaveChangesAsync();

                // Recargar con las relaciones
                return await GetByIdAsync(program.Id) ?? program;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando programa {program.Id}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var program = await _context.MachinePrograms.FindAsync(id);
                if (program == null)
                {
                    return false;
                }

                _context.MachinePrograms.Remove(program);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error eliminando programa {id}");
                throw;
            }
        }

        public async Task<bool> ExistsByOtSapAsync(string otSap, int? excludeId = null)
        {
            try
            {
                var query = _context.MachinePrograms.Where(p => p.OtSap == otSap);
                
                if (excludeId.HasValue)
                {
                    query = query.Where(p => p.Id != excludeId.Value);
                }

                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verificando existencia de OT SAP {otSap}");
                throw;
            }
        }

        public async Task<MachineProgramStatisticsDto> GetStatisticsAsync()
        {
            try
            {
                var programs = await _context.MachinePrograms.ToListAsync();
                
                var statusStats = programs
                    .GroupBy(p => p.Estado)
                    .Select(g => new { Estado = g.Key, Count = g.Count() })
                    .ToList();

                var activeMachines = programs
                    .Where(p => p.Estado == "CORRIENDO")
                    .Select(p => p.MachineNumber)
                    .Distinct()
                    .Count();

                return new MachineProgramStatisticsDto
                {
                    StatusStats = statusStats.Select(s => new StatusStatDto 
                    { 
                        Estado = s.Estado, 
                        Count = s.Count 
                    }).ToList(),
                    TotalPrograms = programs.Count,
                    ActiveMachines = activeMachines,
                    TotalMachines = programs.Select(p => p.MachineNumber).Distinct().Count(),
                    CompletedPrograms = programs.Count(p => p.Estado == "TERMINADO"),
                    PendingPrograms = programs.Count(p => p.Estado == "LISTO"),
                    SuspendedPrograms = programs.Count(p => p.Estado == "SUSPENDIDO"),
                    RunningPrograms = programs.Count(p => p.Estado == "CORRIENDO")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo estadísticas");
                throw;
            }
        }

        public async Task<IEnumerable<MachineProgram>> GetActiveProgramsAsync()
        {
            try
            {
                var activeStatuses = new[] { "LISTO", "CORRIENDO", "SUSPENDIDO" };
                
                return await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .Where(p => activeStatuses.Contains(p.Estado))
                    .OrderBy(p => p.MachineNumber)
                    .ThenBy(p => p.FechaInicio)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programas activos");
                throw;
            }
        }

        public async Task<IEnumerable<int>> GetActiveMachineNumbersAsync()
        {
            try
            {
                var activeStatuses = new[] { "LISTO", "CORRIENDO", "SUSPENDIDO" };
                
                return await _context.MachinePrograms
                    .Where(p => activeStatuses.Contains(p.Estado))
                    .Select(p => p.MachineNumber)
                    .Distinct()
                    .OrderBy(m => m)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo números de máquinas activas");
                throw;
            }
        }

        // Método para sincronización en tiempo real
        public async Task<IEnumerable<MachineProgram>> GetProgramsForSyncAsync(DateTime since)
        {
            try
            {
                return await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .Where(p => p.UpdatedAt >= since)
                    .OrderBy(p => p.UpdatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo programas para sincronización desde {since}");
                throw;
            }
        }

        // Método para obtener acciones recientes
        public async Task<IEnumerable<object>> GetRecentActionsAsync(int limit = 50)
        {
            try
            {
                var recentPrograms = await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .OrderByDescending(p => p.UpdatedAt)
                    .Take(limit)
                    .Select(p => new
                    {
                        p.Id,
                        p.MachineNumber,
                        p.Articulo,
                        p.Estado,
                        p.UpdatedAt,
                        OperatorName = p.UpdatedByUser != null ? $"{p.UpdatedByUser.FirstName} {p.UpdatedByUser.LastName}".Trim() : "Sistema",
                        Action = $"Cambio de estado a {p.Estado}"
                    })
                    .ToListAsync();

                return recentPrograms;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo acciones recientes");
                throw;
            }
        }

        // Método para obtener programas por operario
        public async Task<IEnumerable<MachineProgram>> GetProgramsByOperatorAsync(string operatorName)
        {
            try
            {
                return await _context.MachinePrograms
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .Where(p => p.UpdatedByUser != null && $"{p.UpdatedByUser.FirstName} {p.UpdatedByUser.LastName}".Trim() == operatorName)
                    .OrderByDescending(p => p.UpdatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo programas del operario {operatorName}");
                throw;
            }
        }
    }
}
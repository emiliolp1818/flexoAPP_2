using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Repositories;
using flexoAPP.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FlexoAPP.API.Repositories
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
                    .OrderBy(p => p.MachineNumber)
                    .ThenBy(p => p.FechaInicio)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo todos los programas");
                throw;
            }
        }

        public async Task<MachineProgram?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.MachinePrograms
                    .FirstOrDefaultAsync(p => p.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programa con ID {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<MachineProgram>> GetByMachineNumberAsync(int machineNumber)
        {
            try
            {
                return await _context.MachinePrograms
                    .Where(p => p.MachineNumber == machineNumber)
                    .OrderBy(p => p.FechaInicio)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programas de la máquina {MachineNumber}", machineNumber);
                throw;
            }
        }

        public async Task<IEnumerable<MachineProgram>> GetByStatusAsync(string status)
        {
            try
            {
                return await _context.MachinePrograms
                    .Where(p => p.Estado == status)
                    .OrderBy(p => p.MachineNumber)
                    .ThenBy(p => p.FechaInicio)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programas por estado {Status}", status);
                throw;
            }
        }

        public async Task<MachineProgram?> GetByArticuloAndOtSapAsync(string articulo, string otSap)
        {
            try
            {
                return await _context.MachinePrograms
                    .FirstOrDefaultAsync(p => p.Articulo == articulo && p.OtSap == otSap);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programa por artículo {Articulo} y OT SAP {OtSap}", articulo, otSap);
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
                return program;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando programa");
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
                return program;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando programa con ID {Id}", program.Id);
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
                _logger.LogError(ex, "Error eliminando programa con ID {Id}", id);
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
                    .Select(g => new StatusStatDto
                    {
                        Estado = g.Key,
                        Count = g.Count()
                    })
                    .ToList();

                var activeMachines = programs
                    .Where(p => p.Estado == "CORRIENDO" || p.Estado == "LISTO")
                    .Select(p => p.MachineNumber)
                    .Distinct()
                    .Count();

                return new MachineProgramStatisticsDto
                {
                    StatusStats = statusStats,
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
    }
}
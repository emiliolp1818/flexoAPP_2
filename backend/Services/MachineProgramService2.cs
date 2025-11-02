using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Repositories;
using FlexoAPP.API.Services;
using flexoAPP.Models.DTOs;
using System.Text.Json;

namespace FlexoAPP.API.Services
{
    public class MachineProgramService : IMachineProgramService
    {
        private readonly IMachineProgramRepository _repository;
        private readonly ILogger<MachineProgramService> _logger;

        public MachineProgramService(
            IMachineProgramRepository repository,
            ILogger<MachineProgramService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<MachineProgram>> GetAllProgramsAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo todos los programas");
                throw;
            }
        }

        public async Task<MachineProgram?> GetProgramByIdAsync(int id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programa con ID {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<MachineProgram>> GetProgramsByMachineAsync(int machineNumber)
        {
            try
            {
                return await _repository.GetByMachineNumberAsync(machineNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programas de la máquina {MachineNumber}", machineNumber);
                throw;
            }
        }

        public async Task<IEnumerable<MachineProgram>> GetProgramsByStatusAsync(string status)
        {
            try
            {
                return await _repository.GetByStatusAsync(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programas por estado {Status}", status);
                throw;
            }
        }

        public async Task<MachineProgram?> GetProgramByArticuloAndOtSapAsync(string articulo, string otSap)
        {
            try
            {
                return await _repository.GetByArticuloAndOtSapAsync(articulo, otSap);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo programa por artículo {Articulo} y OT SAP {OtSap}", articulo, otSap);
                throw;
            }
        }

        public async Task<MachineProgram> CreateProgramAsync(MachineProgram program)
        {
            try
            {
                // Verificar si ya existe un programa con el mismo artículo y OT SAP
                var existingProgram = await _repository.GetByArticuloAndOtSapAsync(program.Articulo, program.OtSap);
                if (existingProgram != null)
                {
                    throw new InvalidOperationException($"Ya existe un programa con el artículo {program.Articulo} y OT SAP {program.OtSap}");
                }

                return await _repository.CreateAsync(program);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando programa");
                throw;
            }
        }

        public async Task<MachineProgram> UpdateProgramAsync(MachineProgram program)
        {
            try
            {
                return await _repository.UpdateAsync(program);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando programa con ID {Id}", program.Id);
                throw;
            }
        }

        public async Task<bool> DeleteProgramAsync(int id)
        {
            try
            {
                return await _repository.DeleteAsync(id);
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
                return await _repository.GetStatisticsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo estadísticas");
                throw;
            }
        }
    }
}
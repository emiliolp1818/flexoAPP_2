using AutoMapper;
using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;
using flexoAPP.Repositories;
using flexoAPP.Hubs;
using FlexoAPP.API.Services;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.IO;

namespace flexoAPP.Services
{
    public class MachineProgramService : IMachineProgramService
    {
        private readonly IMachineProgramRepository _repository;
        private readonly IMapper _mapper;
        private readonly IAuditService _auditService;
        private readonly IHubContext<MachineProgramHub> _hubContext;
        private readonly ILogger<MachineProgramService> _logger;

        public MachineProgramService(
            IMachineProgramRepository repository, 
            IMapper mapper,
            IAuditService auditService,
            IHubContext<MachineProgramHub> hubContext,
            ILogger<MachineProgramService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _auditService = auditService;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<IEnumerable<MachineProgramDto>> GetAllAsync()
        {
            var programs = await _repository.GetAllAsync();
            return programs.Select(MapToDto);
        }

        public async Task<MachineProgramDto?> GetByIdAsync(int id)
        {
            var program = await _repository.GetByIdAsync(id);
            return program != null ? MapToDto(program) : null;
        }

        public async Task<IEnumerable<MachineProgramDto>> GetByMachineNumberAsync(int machineNumber)
        {
            var programs = await _repository.GetByMachineNumberAsync(machineNumber);
            return programs.Select(MapToDto);
        }

        public async Task<IEnumerable<MachineProgramDto>> GetByStatusAsync(string status)
        {
            var programs = await _repository.GetByStatusAsync(status);
            return programs.Select(MapToDto);
        }

        public async Task<MachineProgramDto> CreateAsync(CreateMachineProgramDto createDto, int? userId)
        {
            // Validar que no exista un programa con el mismo OT SAP
            if (await _repository.ExistsByOtSapAsync(createDto.OtSap))
            {
                throw new InvalidOperationException($"Ya existe un programa con el OT SAP: {createDto.OtSap}");
            }

            var program = new MachineProgram
            {
                MachineNumber = createDto.MachineNumber,
                Name = createDto.Name ?? createDto.Articulo, // Usar artículo como nombre si no se proporciona
                Articulo = createDto.Articulo,
                OtSap = createDto.OtSap,
                Cliente = createDto.Cliente,
                Referencia = createDto.Referencia,
                Td = createDto.Td,
                NumeroColores = createDto.Colores.Count,
                Colores = JsonSerializer.Serialize(createDto.Colores),
                Sustrato = createDto.Sustrato,
                Kilos = createDto.Kilos,
                Estado = createDto.Estado ?? "PREPARANDO", // Usar estado del DTO o PREPARANDO por defecto
                FechaInicio = createDto.FechaInicio ?? DateTime.Now,
                FechaTintaEnMaquina = createDto.FechaTintaEnMaquina ?? DateTime.Now, // Usar fecha del Excel o fecha actual
                Progreso = 0,
                Observaciones = createDto.Observaciones,
                CreatedBy = userId,
                UpdatedBy = userId
            };

            var createdProgram = await _repository.CreateAsync(program);
            var createdDto = MapToDto(createdProgram);

            // Auditoría
            if (userId.HasValue)
            {
                await _auditService.LogAsync(
                    userId.Value,
                    "CREATE",
                    "MachineProgram",
                    createdProgram.Id,
                    null,
                    JsonSerializer.Serialize(createdDto)
                );
            }

            // Notificación en tiempo real
            try
            {
                await _hubContext.NotifyProgramCreated(createdDto);
                _logger.LogInformation($"✅ Programa creado y notificado: {createdDto.Articulo} - Máquina {createdDto.MachineNumber}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Error notificando creación de programa {createdDto.Articulo}");
            }

            return createdDto;
        }

        public async Task<MachineProgramDto> UpdateAsync(int id, UpdateMachineProgramDto updateDto, int? userId)
        {
            var existingProgram = await _repository.GetByIdAsync(id);
            if (existingProgram == null)
            {
                throw new KeyNotFoundException($"Programa con ID {id} no encontrado");
            }

            // Validar OT SAP si se está actualizando
            if (!string.IsNullOrEmpty(updateDto.OtSap) && 
                updateDto.OtSap != existingProgram.OtSap &&
                await _repository.ExistsByOtSapAsync(updateDto.OtSap, id))
            {
                throw new InvalidOperationException($"Ya existe un programa con el OT SAP: {updateDto.OtSap}");
            }

            var oldData = JsonSerializer.Serialize(MapToDto(existingProgram));

            // Actualizar solo los campos proporcionados
            if (!string.IsNullOrEmpty(updateDto.Name))
                existingProgram.Name = updateDto.Name;
            
            if (!string.IsNullOrEmpty(updateDto.Articulo))
                existingProgram.Articulo = updateDto.Articulo;
            
            if (!string.IsNullOrEmpty(updateDto.OtSap))
                existingProgram.OtSap = updateDto.OtSap;
            
            if (!string.IsNullOrEmpty(updateDto.Cliente))
                existingProgram.Cliente = updateDto.Cliente;
            
            if (!string.IsNullOrEmpty(updateDto.Referencia))
                existingProgram.Referencia = updateDto.Referencia;
            
            if (!string.IsNullOrEmpty(updateDto.Td))
                existingProgram.Td = updateDto.Td;
            
            if (updateDto.Colores != null)
                existingProgram.Colores = JsonSerializer.Serialize(updateDto.Colores);
            
            if (!string.IsNullOrEmpty(updateDto.Sustrato))
                existingProgram.Sustrato = updateDto.Sustrato;
            
            if (updateDto.Kilos.HasValue)
                existingProgram.Kilos = updateDto.Kilos.Value;
            
            if (!string.IsNullOrEmpty(updateDto.Estado))
                existingProgram.Estado = updateDto.Estado;
            
            if (updateDto.FechaInicio.HasValue)
                existingProgram.FechaInicio = updateDto.FechaInicio.Value;
            
            if (updateDto.FechaFin.HasValue)
                existingProgram.FechaFin = updateDto.FechaFin.Value;
            
            if (updateDto.Progreso.HasValue)
                existingProgram.Progreso = updateDto.Progreso.Value;
            
            if (updateDto.Observaciones != null)
                existingProgram.Observaciones = updateDto.Observaciones;

            existingProgram.UpdatedBy = userId;

            var updatedProgram = await _repository.UpdateAsync(existingProgram);
            var updatedDto = MapToDto(updatedProgram);

            // Auditoría
            if (userId.HasValue)
            {
                await _auditService.LogAsync(
                    userId.Value,
                    "UPDATE",
                    "MachineProgram",
                    updatedProgram.Id,
                    oldData,
                    JsonSerializer.Serialize(updatedDto)
                );
            }

            // Notificación en tiempo real
            try
            {
                await _hubContext.NotifyProgramUpdated(updatedDto);
                _logger.LogInformation($"Programa actualizado y notificado en tiempo real: {updatedDto.Articulo}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Error notificando actualización de programa {updatedDto.Articulo}");
            }

            return updatedDto;
        }

        public async Task<MachineProgramDto> ChangeStatusAsync(int id, ChangeStatusDto changeStatusDto, int? userId)
        {
            var existingProgram = await _repository.GetByIdAsync(id);
            if (existingProgram == null)
            {
                throw new KeyNotFoundException($"Programa con ID {id} no encontrado");
            }

            var oldData = JsonSerializer.Serialize(MapToDto(existingProgram));
            var oldStatus = existingProgram.Estado;

            existingProgram.Estado = changeStatusDto.Estado;
            existingProgram.UpdatedBy = userId;

            // Lógica específica por estado
            switch (changeStatusDto.Estado)
            {
                case "TERMINADO":
                    existingProgram.FechaFin = DateTime.UtcNow;
                    existingProgram.Progreso = 100;
                    break;
                
                case "CORRIENDO":
                    if (existingProgram.Progreso == 0)
                    {
                        existingProgram.Progreso = 5;
                    }
                    break;
                
                case "SUSPENDIDO":
                    if (!string.IsNullOrEmpty(changeStatusDto.Observaciones))
                    {
                        existingProgram.Observaciones = changeStatusDto.Observaciones;
                    }
                    break;
            }

            var updatedProgram = await _repository.UpdateAsync(existingProgram);
            var updatedDto = MapToDto(updatedProgram);

            // Auditoría
            if (userId.HasValue)
            {
                await _auditService.LogAsync(
                    userId.Value,
                    "STATUS_CHANGE",
                    "MachineProgram",
                    updatedProgram.Id,
                    $"Estado: {oldStatus}",
                    $"Estado: {updatedProgram.Estado}"
                );
            }

            // Notificación en tiempo real
            try
            {
                await _hubContext.NotifyStatusChanged(
                    updatedProgram.Id, 
                    updatedProgram.Estado, 
                    updatedProgram.MachineNumber, 
                    changeStatusDto.Observaciones
                );
                _logger.LogInformation($"Cambio de estado notificado en tiempo real: Programa {updatedProgram.Id} a {updatedProgram.Estado}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Error notificando cambio de estado del programa {updatedProgram.Id}");
            }

            return updatedDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existingProgram = await _repository.GetByIdAsync(id);
            if (existingProgram == null)
            {
                return false;
            }

            return await _repository.DeleteAsync(id);
        }

        public async Task<MachineProgramStatisticsDto> GetStatisticsAsync()
        {
            return await _repository.GetStatisticsAsync();
        }

        public async Task<IEnumerable<MachineProgramDto>> GetActiveProgramsAsync()
        {
            var programs = await _repository.GetActiveProgramsAsync();
            return programs.Select(MapToDto);
        }

        public async Task<IEnumerable<int>> GetActiveMachineNumbersAsync()
        {
            return await _repository.GetActiveMachineNumbersAsync();
        }

        public async Task<bool> ValidateOtSapAsync(string otSap, int? excludeId = null)
        {
            return !await _repository.ExistsByOtSapAsync(otSap, excludeId);
        }

        private MachineProgramDto MapToDto(MachineProgram program)
        {
            List<string> colores;
            try
            {
                colores = JsonSerializer.Deserialize<List<string>>(program.Colores) ?? new List<string>();
            }
            catch
            {
                colores = new List<string>();
            }

            return new MachineProgramDto
            {
                Id = program.Id,
                MachineNumber = program.MachineNumber,
                Name = program.Name,
                Articulo = program.Articulo,
                OtSap = program.OtSap,
                Cliente = program.Cliente,
                Referencia = program.Referencia,
                Td = program.Td,
                Colores = colores,
                Sustrato = program.Sustrato,
                Kilos = program.Kilos,
                Estado = program.Estado,
                FechaInicio = program.FechaInicio,
                FechaFin = program.FechaFin,
                Progreso = program.Progreso,
                Observaciones = program.Observaciones,
                CreatedBy = program.CreatedBy,
                UpdatedBy = program.UpdatedBy,
                CreatedAt = program.CreatedAt,
                UpdatedAt = program.UpdatedAt
            };
        }

        public async Task<ExcelProcessResultDto> ProcessExcelFileAsync(IFormFile file, int? userId)
        {
            try
            {
                _logger.LogInformation("🔄 Procesando archivo Excel: {FileName}", file.FileName);

                var programs = new List<MachineProgramDto>();
                var validationErrors = new List<string>();

                using var stream = file.OpenReadStream();
                using var reader = new StreamReader(stream);
                
                // Leer líneas del archivo
                var lines = new List<string>();
                string? line;
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    lines.Add(line);
                }

                if (lines.Count < 2)
                {
                    return new ExcelProcessResultDto
                    {
                        Success = false,
                        ErrorMessage = "El archivo debe contener al menos una fila de datos además del encabezado"
                    };
                }

                // Procesar cada línea (saltando encabezados e instrucciones)
                var dataLines = lines.Where(l => !l.StartsWith("#") && !string.IsNullOrWhiteSpace(l)).Skip(1);
                
                foreach (var dataLine in dataLines)
                {
                    try
                    {
                        var program = await ProcessExcelLine(dataLine, userId);
                        if (program != null)
                        {
                            programs.Add(program);
                        }
                    }
                    catch (Exception ex)
                    {
                        validationErrors.Add($"Error en línea '{dataLine}': {ex.Message}");
                    }
                }

                _logger.LogInformation("✅ Procesamiento completado: {Count} programas procesados", programs.Count);

                return new ExcelProcessResultDto
                {
                    Success = true,
                    ProcessedCount = programs.Count,
                    Programs = programs,
                    ValidationErrors = validationErrors.Any() ? validationErrors : null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error procesando archivo Excel");
                return new ExcelProcessResultDto
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        private async Task<MachineProgramDto?> ProcessExcelLine(string line, int? userId)
        {
            // Parsear CSV considerando que los valores pueden estar entre comillas
            var columns = ParseCsvLine(line);
            
            _logger.LogInformation("📋 Procesando línea con {Count} columnas: {Line}", columns.Count, line);
            
            if (columns.Count < 11)
            {
                throw new ArgumentException($"La línea debe tener 11 columnas (MÁQUINA, ARTÍCULO, OT SAP, CLIENTE, REFERENCIA, TD, N° COLORES, COLORES, KILOS, FECHA TINTA EN MÁQUINA, SUSTRATO). Se encontraron {columns.Count} columnas.");
            }

            // Parsear colores desde la columna COLORES (índice 7)
            var colores = new List<string>();
            if (!string.IsNullOrWhiteSpace(columns[7]))
            {
                // Los colores vienen separados por coma o punto y coma en una sola celda
                var coloresArray = columns[7].Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var color in coloresArray)
                {
                    var colorTrimmed = color.Trim();
                    if (!string.IsNullOrWhiteSpace(colorTrimmed))
                    {
                        colores.Add(colorTrimmed);
                    }
                }
            }

            _logger.LogInformation("🎨 Colores parseados: {Count} colores - {Colores}", colores.Count, string.Join(", ", colores));

            // Parsear fecha de tinta en máquina (índice 9)
            DateTime? fechaTintaEnMaquina = null;
            if (!string.IsNullOrWhiteSpace(columns[9]))
            {
                // Intentar parsear diferentes formatos de fecha
                if (DateTime.TryParse(columns[9], out var fecha))
                {
                    fechaTintaEnMaquina = fecha;
                    _logger.LogInformation("📅 Fecha parseada correctamente: {Fecha}", fechaTintaEnMaquina);
                }
                else
                {
                    // Si no se puede parsear, usar fecha actual
                    fechaTintaEnMaquina = DateTime.Now;
                    _logger.LogWarning("⚠️ No se pudo parsear la fecha '{Fecha}', usando fecha actual", columns[9]);
                }
            }
            else
            {
                fechaTintaEnMaquina = DateTime.Now;
                _logger.LogWarning("⚠️ Fecha vacía, usando fecha actual");
            }

            // Crear DTO según el formato especificado:
            // Columna 0: MÁQUINA
            // Columna 1: ARTÍCULO
            // Columna 2: OT SAP
            // Columna 3: CLIENTE
            // Columna 4: REFERENCIA
            // Columna 5: TD
            // Columna 6: N° COLORES
            // Columna 7: COLORES
            // Columna 8: KILOS
            // Columna 9: FECHA TINTA EN MÁQUINA
            // Columna 10: SUSTRATO
            var createDto = new CreateMachineProgramDto
            {
                MachineNumber = int.TryParse(columns[0], out var machine) ? machine : 11,
                Articulo = columns[1],
                OtSap = columns[2],
                Cliente = columns[3],
                Referencia = columns[4],
                Td = columns[5],
                Colores = colores,
                Kilos = decimal.TryParse(columns[8], out var kilos) ? kilos : 0,
                FechaTintaEnMaquina = fechaTintaEnMaquina,
                Sustrato = columns[10],
                Estado = "PREPARANDO", // Estado por defecto para nuevos programas
                Observaciones = null
            };

            _logger.LogInformation("✅ DTO creado: Máquina={Machine}, Artículo={Articulo}, Colores={NumColores}", 
                createDto.MachineNumber, createDto.Articulo, createDto.Colores.Count);

            return await CreateAsync(createDto, userId);
        }

        /// <summary>
        /// Parsea una línea CSV considerando valores entre comillas que pueden contener comas
        /// </summary>
        private List<string> ParseCsvLine(string line)
        {
            var columns = new List<string>();
            var currentColumn = new System.Text.StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    columns.Add(currentColumn.ToString().Trim());
                    currentColumn.Clear();
                }
                else
                {
                    currentColumn.Append(c);
                }
            }

            // Agregar la última columna
            columns.Add(currentColumn.ToString().Trim());

            return columns;
        }

        public async Task<int> ClearAllProgrammingAsync(int? userId)
        {
            try
            {
                _logger.LogWarning("🗑️ Limpiando toda la programación de máquinas - Usuario: {UserId}", userId);

                var allPrograms = await _repository.GetAllAsync();
                var deletedCount = 0;

                foreach (var program in allPrograms)
                {
                    await _repository.DeleteAsync(program.Id);
                    deletedCount++;

                    // Auditoría
                    if (userId.HasValue)
                    {
                        await _auditService.LogActionAsync(
                            "MachineProgram",
                            program.Id,
                            "DELETE_PROGRAM",
                            $"Programa eliminado durante limpieza masiva: {program.Articulo}",
                            userId.Value
                        );
                    }
                }

                // Notificar a través de SignalR
                await _hubContext.Clients.All.SendAsync("ProgrammingCleared", new { deletedCount, clearedAt = DateTime.UtcNow });

                _logger.LogInformation("✅ Programación limpiada: {Count} programas eliminados", deletedCount);
                return deletedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error limpiando programación");
                throw;
            }
        }

        public async Task<int> GetTotalCountAsync()
        {
            try
            {
                var programs = await _repository.GetAllAsync();
                return programs.Count();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo el conteo total de programas");
                return 0;
            }
        }
    }
}
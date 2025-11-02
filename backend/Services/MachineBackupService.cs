using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;
using System.Text.Json;
using System.IO.Compression;
using System.Text;

namespace FlexoAPP.API.Services
{
    public class MachineBackupService : IMachineBackupService
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<MachineBackupService> _logger;
        private readonly string _backupPath;

        public MachineBackupService(
            FlexoAPPDbContext context, 
            ILogger<MachineBackupService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _backupPath = configuration.GetValue<string>("BackupSettings:Path") ?? 
                         Path.Combine(Directory.GetCurrentDirectory(), "Backups", "Machines");
            
            // Crear directorio de backups si no existe
            Directory.CreateDirectory(_backupPath);
        }

        public async Task<MachineBackupResultDto> CreateBackupAsync(MachineBackupRequestDto request)
        {
            try
            {
                _logger.LogInformation("🔄 Iniciando backup de máquinas...");

                var backupId = $"backup_{DateTime.Now:yyyyMMdd_HHmmss}_{Guid.NewGuid().ToString("N")[..8]}";
                var backupFolder = Path.Combine(_backupPath, backupId);
                Directory.CreateDirectory(backupFolder);

                // Obtener datos según filtros
                var query = _context.MachinePrograms.AsQueryable();

                if (request.StartDate.HasValue)
                    query = query.Where(p => p.FechaInicio >= request.StartDate.Value);

                if (request.EndDate.HasValue)
                    query = query.Where(p => p.FechaInicio <= request.EndDate.Value);

                if (request.MachineNumbers?.Any() == true)
                    query = query.Where(p => request.MachineNumbers.Contains(p.MachineNumber));

                if (request.Status?.Any() == true)
                    query = query.Where(p => request.Status.Contains(p.Estado));

                var machinePrograms = await query
                    .Include(p => p.CreatedByUser)
                    .Include(p => p.UpdatedByUser)
                    .ToListAsync();

                // Crear backup de datos principales
                var backupData = new MachineBackupDataDto
                {
                    BackupId = backupId,
                    CreatedAt = DateTime.UtcNow,
                    Description = request.Description ?? $"Backup automático - {DateTime.Now:yyyy-MM-dd HH:mm}",
                    MachinePrograms = machinePrograms.Select(p => new MachineProgramBackupDto
                    {
                        Id = p.Id,
                        MachineNumber = p.MachineNumber,
                        Name = p.Name,
                        Articulo = p.Articulo,
                        OtSap = p.OtSap,
                        Cliente = p.Cliente,
                        Referencia = p.Referencia,
                        Td = p.Td,
                        Colores = p.Colores,
                        Sustrato = p.Sustrato,
                        Kilos = p.Kilos,
                        Estado = p.Estado,
                        FechaInicio = p.FechaInicio,
                        FechaFin = p.FechaFin,
                        Progreso = p.Progreso,
                        Observaciones = p.Observaciones,
                        LastActionBy = p.LastActionBy,
                        LastActionAt = p.LastActionAt,
                        LastAction = p.LastAction,
                        OperatorName = p.OperatorName,
                        CreatedBy = p.CreatedBy,
                        UpdatedBy = p.UpdatedBy,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt
                    }).ToList(),
                    TotalRecords = machinePrograms.Count,
                    BackupSize = 0 // Se calculará después
                };

                // Guardar datos principales en JSON
                var jsonData = JsonSerializer.Serialize(backupData, new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                var jsonFile = Path.Combine(backupFolder, "machine_programs.json");
                await File.WriteAllTextAsync(jsonFile, jsonData, Encoding.UTF8);

                // Crear archivo de metadatos
                var metadata = new MachineBackupMetadataDto
                {
                    BackupId = backupId,
                    CreatedAt = DateTime.UtcNow,
                    Description = backupData.Description,
                    TotalRecords = backupData.TotalRecords,
                    MachineNumbers = machinePrograms.Select(p => p.MachineNumber).Distinct().OrderBy(x => x).ToList(),
                    DateRange = new BackupDateRangeDto
                    {
                        StartDate = machinePrograms.Any() ? machinePrograms.Min(p => p.FechaInicio) : DateTime.MinValue,
                        EndDate = machinePrograms.Any() ? machinePrograms.Max(p => p.FechaInicio) : DateTime.MinValue
                    },
                    StatusBreakdown = machinePrograms.GroupBy(p => p.Estado)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    BackupVersion = "1.0",
                    ApplicationVersion = "FlexoAPP 1.0"
                };

                var metadataJson = JsonSerializer.Serialize(metadata, new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                var metadataFile = Path.Combine(backupFolder, "metadata.json");
                await File.WriteAllTextAsync(metadataFile, metadataJson, Encoding.UTF8);

                // Crear archivo comprimido
                var zipFile = Path.Combine(_backupPath, $"{backupId}.zip");
                ZipFile.CreateFromDirectory(backupFolder, zipFile);

                // Calcular tamaño del backup
                var backupSize = new FileInfo(zipFile).Length;
                
                // Actualizar metadatos con el tamaño
                metadata.BackupSize = backupSize;
                await File.WriteAllTextAsync(metadataFile, JsonSerializer.Serialize(metadata, new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }), Encoding.UTF8);

                // Recrear ZIP con metadatos actualizados
                File.Delete(zipFile);
                ZipFile.CreateFromDirectory(backupFolder, zipFile);

                // Limpiar carpeta temporal
                Directory.Delete(backupFolder, true);

                _logger.LogInformation($"✅ Backup creado exitosamente: {backupId} ({backupSize / 1024.0 / 1024.0:F2} MB)");

                return new MachineBackupResultDto
                {
                    Success = true,
                    BackupId = backupId,
                    Message = $"Backup creado exitosamente con {backupData.TotalRecords} registros",
                    TotalRecords = backupData.TotalRecords,
                    BackupSize = backupSize,
                    CreatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando backup de máquinas");
                return new MachineBackupResultDto
                {
                    Success = false,
                    Message = $"Error creando backup: {ex.Message}",
                    BackupId = null,
                    TotalRecords = 0,
                    BackupSize = 0,
                    CreatedAt = DateTime.UtcNow
                };
            }
        }

        public async Task<List<MachineBackupInfoDto>> GetBackupsListAsync()
        {
            try
            {
                var backups = new List<MachineBackupInfoDto>();
                var zipFiles = Directory.GetFiles(_backupPath, "*.zip");

                foreach (var zipFile in zipFiles)
                {
                    try
                    {
                        var fileInfo = new FileInfo(zipFile);
                        var backupId = Path.GetFileNameWithoutExtension(zipFile);

                        // Extraer metadatos del ZIP
                        using var archive = ZipFile.OpenRead(zipFile);
                        var metadataEntry = archive.GetEntry($"{backupId}/metadata.json");
                        
                        if (metadataEntry != null)
                        {
                            using var stream = metadataEntry.Open();
                            using var reader = new StreamReader(stream);
                            var metadataJson = await reader.ReadToEndAsync();
                            var metadata = JsonSerializer.Deserialize<MachineBackupMetadataDto>(metadataJson, 
                                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                            if (metadata != null)
                            {
                                backups.Add(new MachineBackupInfoDto
                                {
                                    BackupId = metadata.BackupId,
                                    Description = metadata.Description,
                                    CreatedAt = metadata.CreatedAt,
                                    TotalRecords = metadata.TotalRecords,
                                    BackupSize = fileInfo.Length,
                                    MachineCount = metadata.MachineNumbers?.Count ?? 0,
                                    DateRange = metadata.DateRange,
                                    StatusBreakdown = metadata.StatusBreakdown,
                                    IsValid = true
                                });
                            }
                        }
                        else
                        {
                            // Backup sin metadatos (formato antiguo)
                            backups.Add(new MachineBackupInfoDto
                            {
                                BackupId = backupId,
                                Description = "Backup sin metadatos",
                                CreatedAt = fileInfo.CreationTime,
                                TotalRecords = 0,
                                BackupSize = fileInfo.Length,
                                MachineCount = 0,
                                IsValid = false
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning($"Error leyendo backup {zipFile}: {ex.Message}");
                    }
                }

                return backups.OrderByDescending(b => b.CreatedAt).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo lista de backups");
                return new List<MachineBackupInfoDto>();
            }
        }

        public async Task<bool> RestoreBackupAsync(string backupId)
        {
            try
            {
                _logger.LogInformation($"🔄 Iniciando restauración de backup: {backupId}");

                var zipFile = Path.Combine(_backupPath, $"{backupId}.zip");
                if (!File.Exists(zipFile))
                {
                    _logger.LogWarning($"Archivo de backup no encontrado: {zipFile}");
                    return false;
                }

                var tempFolder = Path.Combine(Path.GetTempPath(), $"restore_{backupId}");
                if (Directory.Exists(tempFolder))
                    Directory.Delete(tempFolder, true);

                // Extraer backup
                ZipFile.ExtractToDirectory(zipFile, tempFolder);

                var dataFile = Path.Combine(tempFolder, backupId, "machine_programs.json");
                if (!File.Exists(dataFile))
                {
                    _logger.LogWarning($"Archivo de datos no encontrado en backup: {dataFile}");
                    return false;
                }

                // Leer datos del backup
                var jsonData = await File.ReadAllTextAsync(dataFile);
                var backupData = JsonSerializer.Deserialize<MachineBackupDataDto>(jsonData,
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                if (backupData?.MachinePrograms == null)
                {
                    _logger.LogWarning("Datos de backup inválidos");
                    return false;
                }

                // Crear transacción para restauración
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Limpiar datos existentes (opcional - comentar si no se desea)
                    // await _context.MachinePrograms.ExecuteDeleteAsync();

                    // Restaurar programas de máquinas
                    foreach (var programDto in backupData.MachinePrograms)
                    {
                        var existingProgram = await _context.MachinePrograms
                            .FirstOrDefaultAsync(p => p.Id == programDto.Id);

                        if (existingProgram == null)
                        {
                            // Crear nuevo programa
                            var newProgram = new MachineProgram
                            {
                                Id = programDto.Id,
                                MachineNumber = programDto.MachineNumber,
                                Name = programDto.Name,
                                Articulo = programDto.Articulo,
                                OtSap = programDto.OtSap,
                                Cliente = programDto.Cliente,
                                Referencia = programDto.Referencia,
                                Td = programDto.Td,
                                Colores = programDto.Colores,
                                Sustrato = programDto.Sustrato,
                                Kilos = programDto.Kilos,
                                Estado = programDto.Estado,
                                FechaInicio = programDto.FechaInicio,
                                FechaFin = programDto.FechaFin,
                                Progreso = programDto.Progreso,
                                Observaciones = programDto.Observaciones,
                                LastActionBy = programDto.LastActionBy,
                                LastActionAt = programDto.LastActionAt,
                                LastAction = programDto.LastAction,
                                OperatorName = programDto.OperatorName,
                                CreatedBy = programDto.CreatedBy,
                                UpdatedBy = programDto.UpdatedBy,
                                CreatedAt = programDto.CreatedAt,
                                UpdatedAt = programDto.UpdatedAt
                            };

                            _context.MachinePrograms.Add(newProgram);
                        }
                        else
                        {
                            // Actualizar programa existente
                            existingProgram.MachineNumber = programDto.MachineNumber;
                            existingProgram.Name = programDto.Name;
                            existingProgram.Articulo = programDto.Articulo;
                            existingProgram.OtSap = programDto.OtSap;
                            existingProgram.Cliente = programDto.Cliente;
                            existingProgram.Referencia = programDto.Referencia;
                            existingProgram.Td = programDto.Td;
                            existingProgram.Colores = programDto.Colores;
                            existingProgram.Sustrato = programDto.Sustrato;
                            existingProgram.Kilos = programDto.Kilos;
                            existingProgram.Estado = programDto.Estado;
                            existingProgram.FechaInicio = programDto.FechaInicio;
                            existingProgram.FechaFin = programDto.FechaFin;
                            existingProgram.Progreso = programDto.Progreso;
                            existingProgram.Observaciones = programDto.Observaciones;
                            existingProgram.LastActionBy = programDto.LastActionBy;
                            existingProgram.LastActionAt = programDto.LastActionAt;
                            existingProgram.LastAction = programDto.LastAction;
                            existingProgram.OperatorName = programDto.OperatorName;
                            existingProgram.UpdatedAt = DateTime.UtcNow;
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation($"✅ Backup restaurado exitosamente: {backupData.MachinePrograms.Count} registros");
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Error durante la restauración del backup");
                    throw;
                }
                finally
                {
                    // Limpiar archivos temporales
                    if (Directory.Exists(tempFolder))
                        Directory.Delete(tempFolder, true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error restaurando backup {backupId}");
                return false;
            }
        }

        public async Task<bool> DeleteBackupAsync(string backupId)
        {
            try
            {
                var zipFile = Path.Combine(_backupPath, $"{backupId}.zip");
                if (File.Exists(zipFile))
                {
                    File.Delete(zipFile);
                    _logger.LogInformation($"Backup eliminado: {backupId}");
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error eliminando backup {backupId}");
                return false;
            }
        }

        public async Task<List<MachineProgram>> GetBackupDataForReportsAsync(string backupId)
        {
            try
            {
                var zipFile = Path.Combine(_backupPath, $"{backupId}.zip");
                if (!File.Exists(zipFile))
                    return new List<MachineProgram>();

                var tempFolder = Path.Combine(Path.GetTempPath(), $"report_{backupId}");
                if (Directory.Exists(tempFolder))
                    Directory.Delete(tempFolder, true);

                ZipFile.ExtractToDirectory(zipFile, tempFolder);

                var dataFile = Path.Combine(tempFolder, backupId, "machine_programs.json");
                if (!File.Exists(dataFile))
                    return new List<MachineProgram>();

                var jsonData = await File.ReadAllTextAsync(dataFile);
                var backupData = JsonSerializer.Deserialize<MachineBackupDataDto>(jsonData,
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                if (backupData?.MachinePrograms == null)
                    return new List<MachineProgram>();

                // Convertir DTOs a entidades para reportes
                var programs = backupData.MachinePrograms.Select(dto => new MachineProgram
                {
                    Id = dto.Id,
                    MachineNumber = dto.MachineNumber,
                    Name = dto.Name,
                    Articulo = dto.Articulo,
                    OtSap = dto.OtSap,
                    Cliente = dto.Cliente,
                    Referencia = dto.Referencia,
                    Td = dto.Td,
                    Colores = dto.Colores,
                    Sustrato = dto.Sustrato,
                    Kilos = dto.Kilos,
                    Estado = dto.Estado,
                    FechaInicio = dto.FechaInicio,
                    FechaFin = dto.FechaFin,
                    Progreso = dto.Progreso,
                    Observaciones = dto.Observaciones,
                    LastActionBy = dto.LastActionBy,
                    LastActionAt = dto.LastActionAt,
                    LastAction = dto.LastAction,
                    OperatorName = dto.OperatorName,
                    CreatedBy = dto.CreatedBy,
                    UpdatedBy = dto.UpdatedBy,
                    CreatedAt = dto.CreatedAt,
                    UpdatedAt = dto.UpdatedAt
                }).ToList();

                // Limpiar archivos temporales
                Directory.Delete(tempFolder, true);

                return programs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo datos de backup para reportes: {backupId}");
                return new List<MachineProgram>();
            }
        }

        public async Task<MachineBackupResultDto> CreateDailyBackupAsync()
        {
            var request = new MachineBackupRequestDto
            {
                Description = $"Backup automático diario - {DateTime.Now:yyyy-MM-dd}",
                StartDate = DateTime.Today.AddDays(-1),
                EndDate = DateTime.Today,
                IncludeAllMachines = true
            };

            return await CreateBackupAsync(request);
        }

        public async Task<bool> VerifyBackupIntegrityAsync(string backupId)
        {
            try
            {
                var zipFile = Path.Combine(_backupPath, $"{backupId}.zip");
                if (!File.Exists(zipFile))
                    return false;

                // Verificar que el ZIP no esté corrupto
                using var archive = ZipFile.OpenRead(zipFile);
                
                // Verificar archivos requeridos
                var requiredFiles = new[] { $"{backupId}/metadata.json", $"{backupId}/machine_programs.json" };
                
                foreach (var requiredFile in requiredFiles)
                {
                    var entry = archive.GetEntry(requiredFile);
                    if (entry == null)
                        return false;

                    // Verificar que se puede leer el contenido
                    using var stream = entry.Open();
                    using var reader = new StreamReader(stream);
                    var content = await reader.ReadToEndAsync();
                    
                    if (string.IsNullOrEmpty(content))
                        return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verificando integridad del backup {backupId}");
                return false;
            }
        }

        public async Task<byte[]> ExportBackupToFileAsync(string backupId, string format = "json")
        {
            try
            {
                var zipFile = Path.Combine(_backupPath, $"{backupId}.zip");
                if (!File.Exists(zipFile))
                    throw new FileNotFoundException($"Backup {backupId} no encontrado");

                switch (format.ToLower())
                {
                    case "zip":
                        return await File.ReadAllBytesAsync(zipFile);
                    
                    case "json":
                        var programs = await GetBackupDataForReportsAsync(backupId);
                        var json = JsonSerializer.Serialize(programs, new JsonSerializerOptions 
                        { 
                            WriteIndented = true,
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        });
                        return Encoding.UTF8.GetBytes(json);
                    
                    default:
                        throw new ArgumentException($"Formato no soportado: {format}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error exportando backup {backupId} en formato {format}");
                throw;
            }
        }

        public async Task<MachineBackupResultDto> ImportBackupFromFileAsync(byte[] fileData, string fileName)
        {
            try
            {
                var backupId = $"imported_{DateTime.Now:yyyyMMdd_HHmmss}_{Path.GetFileNameWithoutExtension(fileName)}";
                var zipFile = Path.Combine(_backupPath, $"{backupId}.zip");

                await File.WriteAllBytesAsync(zipFile, fileData);

                // Verificar integridad
                var isValid = await VerifyBackupIntegrityAsync(backupId);
                if (!isValid)
                {
                    File.Delete(zipFile);
                    throw new InvalidOperationException("El archivo de backup importado no es válido");
                }

                return new MachineBackupResultDto
                {
                    Success = true,
                    BackupId = backupId,
                    Message = "Backup importado exitosamente",
                    BackupSize = fileData.Length,
                    CreatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error importando backup desde archivo {fileName}");
                return new MachineBackupResultDto
                {
                    Success = false,
                    Message = $"Error importando backup: {ex.Message}"
                };
            }
        }

        public async Task<MachineBackupStatsDto> GetBackupStatsAsync(string backupId)
        {
            try
            {
                var programs = await GetBackupDataForReportsAsync(backupId);
                
                return new MachineBackupStatsDto
                {
                    BackupId = backupId,
                    TotalPrograms = programs.Count,
                    MachineCount = programs.Select(p => p.MachineNumber).Distinct().Count(),
                    StatusBreakdown = programs.GroupBy(p => p.Estado).ToDictionary(g => g.Key, g => g.Count()),
                    ClientBreakdown = programs.GroupBy(p => p.Cliente).ToDictionary(g => g.Key, g => g.Count()),
                    TotalKilos = programs.Sum(p => p.Kilos),
                    DateRange = programs.Any() ? new BackupDateRangeDto
                    {
                        StartDate = programs.Min(p => p.FechaInicio),
                        EndDate = programs.Max(p => p.FechaInicio)
                    } : null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo estadísticas del backup {backupId}");
                throw;
            }
        }
    }
}
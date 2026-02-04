using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;
using flexoAPP.Repositories;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using System.Text.Json;
using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace flexoAPP.Services
{
    public class MaquinaService : IMaquinaService
    {
        private readonly IMaquinaRepository _repository;
        private readonly ILogger<MaquinaService> _logger;
        private readonly FlexoAPPDbContext _context;
        private readonly FlexoAPP.API.Services.IActivityLoggerService _activityLogger;

        public MaquinaService(
            IMaquinaRepository repository, 
            ILogger<MaquinaService> logger, 
            FlexoAPPDbContext context,
            FlexoAPP.API.Services.IActivityLoggerService activityLogger)
        {
            _repository = repository;
            _logger = logger;
            _context = context;
            _activityLogger = activityLogger;
            EnsureDatabaseSchema();
        }

        private static bool _otSapIndexEnsured = false;
        private void EnsureDatabaseSchema()
        {
            if (_otSapIndexEnsured) return;
            try
            {
                var cs = _context.Database.GetConnectionString();
                using var conn = new MySqlConnector.MySqlConnection(cs);
                conn.Open();

                // 1. Verificar si existe la columna 'id'
                using var checkIdCmd = conn.CreateCommand();
                checkIdCmd.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'id'";
                var idExists = Convert.ToInt32(checkIdCmd.ExecuteScalar()) > 0;

                // 2. Verificar si 'ot_sap' es la PRIMARY KEY
                using var checkPkCmd = conn.CreateCommand();
                checkPkCmd.CommandText = @"
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
                    WHERE tc.TABLE_SCHEMA = DATABASE() 
                    AND tc.TABLE_NAME = 'maquinas' 
                    AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                    AND kcu.COLUMN_NAME = 'ot_sap'";
                var otSapIsPk = Convert.ToInt32(checkPkCmd.ExecuteScalar()) > 0;

                if (idExists || !otSapIsPk)
                {
                    _logger.LogInformation("⚠️ Iniciando migración de esquema de BD: Estableciendo OT SAP como Primary Key...");
                    
                    // Nota: No usamos transacción explícita porque algunos comandos DDL en MySQL causan commit implícito
                    
                    using var cmd = conn.CreateCommand();

                    // Paso 1: Eliminar PRIMARY KEY existente (ya sea 'id' o 'articulo')
                    try {
                        cmd.CommandText = "ALTER TABLE maquinas DROP PRIMARY KEY";
                        cmd.ExecuteNonQuery();
                        _logger.LogInformation("PK anterior eliminada.");
                    } catch (Exception ex) {
                         _logger.LogWarning($"Nota: No se pudo eliminar PK (quizás no existía): {ex.Message}");
                    }

                    // Paso 1.5: Eliminar duplicados de OT SAP antes de proceder
                    // Esto es CRÍTICO para poder establecer ot_sap como PK
                    try {
                        _logger.LogInformation("🧹 Eliminando registros duplicados de OT SAP...");
                        if (idExists)
                        {
                            // Si existe ID, conservamos el ID más alto (el más reciente insertado)
                            cmd.CommandText = @"
                                DELETE t1 FROM maquinas t1
                                INNER JOIN maquinas t2 
                                WHERE t1.ot_sap = t2.ot_sap 
                                AND t1.id < t2.id";
                            cmd.ExecuteNonQuery();
                        }
                        else
                        {
                            // Si no existe ID, conservamos el de fecha más reciente
                            // Nota: Si las fechas son idénticas, esto podría no eliminar todos los duplicados, 
                            // pero es un buen intento sin ID único.
                            cmd.CommandText = @"
                                DELETE t1 FROM maquinas t1
                                INNER JOIN maquinas t2 
                                WHERE t1.ot_sap = t2.ot_sap 
                                AND t1.fecha_tinta_en_maquina < t2.fecha_tinta_en_maquina";
                            cmd.ExecuteNonQuery();
                        }
                        _logger.LogInformation("✅ Duplicados eliminados.");
                    } catch (Exception ex) {
                        _logger.LogWarning($"⚠️ Advertencia al eliminar duplicados: {ex.Message}");
                    }

                    // Paso 2: Eliminar columna 'id' si existe
                    if (idExists)
                    {
                        cmd.CommandText = "ALTER TABLE maquinas DROP COLUMN id";
                        cmd.ExecuteNonQuery();
                        _logger.LogInformation("Columna 'id' eliminada.");
                    }

                    // Paso 3: Asegurar que 'ot_sap' sea NOT NULL
                    cmd.CommandText = "ALTER TABLE maquinas MODIFY COLUMN ot_sap VARCHAR(50) NOT NULL";
                    cmd.ExecuteNonQuery();

                    // Paso 4: Establecer 'ot_sap' como PRIMARY KEY
                    cmd.CommandText = "ALTER TABLE maquinas ADD PRIMARY KEY (ot_sap)";
                    cmd.ExecuteNonQuery();
                    _logger.LogInformation("Nueva PRIMARY KEY establecida en 'ot_sap'.");

                    // Paso 5: Eliminar índice único redundante si existe
                    try {
                        cmd.CommandText = "DROP INDEX uniq_ot_sap ON maquinas";
                        cmd.ExecuteNonQuery();
                    } catch {}
                    
                    _logger.LogInformation("✅ Migración de esquema completada exitosamente.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error crítico migrando esquema de BD: {ex.Message}");
                // No relanzamos para no bloquear el arranque, pero quedará logueado
            }
            finally
            {
                _otSapIndexEnsured = true;
            }
        }

        public async Task<IEnumerable<MaquinaDto>> GetAllAsync()
        {
            var maquinas = await _repository.GetAllAsync();
            return maquinas.Select(MapToDto);
        }

        public async Task<MaquinaDto?> GetByArticuloAsync(string articulo)
        {
            var maquina = await _repository.GetByArticuloAsync(articulo);
            return maquina != null ? MapToDto(maquina) : null;
        }

        public async Task<IEnumerable<MaquinaDto>> GetByNumeroMaquinaAsync(int numeroMaquina)
        {
            var maquinas = await _repository.GetByNumeroMaquinaAsync(numeroMaquina);
            return maquinas.Select(MapToDto);
        }

        public async Task<MaquinaDto> CreateAsync(CreateMaquinaDto createDto, int? userId)
        {
            try
            {
                // Usar SQL RAW para evitar problemas con Entity Framework
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                // ===== UPSERT POR OT SAP (ARTÍCULOS PUEDEN REPETIRSE, OT SAP NO) =====
                // Si existe ot_sap, actualizar el registro; si no existe, insertar nuevo
                
                var coloresJson = System.Text.Json.JsonSerializer.Serialize(createDto.Colores);
                var fechaTinta = createDto.FechaTintaEnMaquina ?? DateTime.Now;

                // Verificar existencia por OT SAP
                using var existsCmd = connection.CreateCommand();
                existsCmd.CommandText = "SELECT estado FROM maquinas WHERE ot_sap=@ot LIMIT 1";
                existsCmd.Parameters.AddWithValue("@ot", createDto.OtSap);
                var existingEstadoObj = await existsCmd.ExecuteScalarAsync();

                string? estadoFinal = createDto.Estado;
                var statesToKeep = new[] { "PREPARANDO", "LISTO", "SUSPENDIDO" };

                if (existingEstadoObj != null && existingEstadoObj != DBNull.Value)
                {
                    var existingEstado = existingEstadoObj.ToString() ?? "";
                    estadoFinal = statesToKeep.Contains(existingEstado) ? existingEstado : createDto.Estado;

                    // Actualizar registro existente por OT SAP
                    using var updateCmd = connection.CreateCommand();
                    updateCmd.CommandText = @"
                        UPDATE maquinas SET 
                            articulo=@articulo, numero_maquina=@numeroMaquina, cliente=@cliente,
                            referencia=@referencia, td=@td, numero_colores=@numeroColores, colores=@colores,
                            kilos=@kilos, fecha_tinta_en_maquina=@fechaTinta, sustrato=@sustrato,
                            estado=@estado, observaciones=@observaciones, updated_by=@updatedBy, updated_at=@updatedAt
                        WHERE ot_sap=@otSap";

                    updateCmd.Parameters.AddWithValue("@articulo", createDto.Articulo);
                    updateCmd.Parameters.AddWithValue("@numeroMaquina", createDto.NumeroMaquina);
                    updateCmd.Parameters.AddWithValue("@cliente", createDto.Cliente);
                    updateCmd.Parameters.AddWithValue("@referencia", createDto.Referencia ?? (object)DBNull.Value);
                    updateCmd.Parameters.AddWithValue("@td", createDto.Td ?? (object)DBNull.Value);
                    updateCmd.Parameters.AddWithValue("@numeroColores", createDto.Colores.Count);
                    updateCmd.Parameters.AddWithValue("@colores", coloresJson);
                    updateCmd.Parameters.AddWithValue("@kilos", createDto.Kilos);
                    updateCmd.Parameters.AddWithValue("@fechaTinta", fechaTinta);
                    updateCmd.Parameters.AddWithValue("@sustrato", createDto.Sustrato);
                    updateCmd.Parameters.AddWithValue("@estado", string.IsNullOrWhiteSpace(estadoFinal) ? (object)DBNull.Value : estadoFinal);
                    updateCmd.Parameters.AddWithValue("@observaciones", createDto.Observaciones ?? (object)DBNull.Value);
                    updateCmd.Parameters.AddWithValue("@updatedBy", userId ?? (object)DBNull.Value);
                    updateCmd.Parameters.AddWithValue("@updatedAt", DateTime.UtcNow);
                    updateCmd.Parameters.AddWithValue("@otSap", createDto.OtSap);

                    await updateCmd.ExecuteNonQueryAsync();
                    _logger.LogInformation("♻️ Registro actualizado por OT SAP: {OtSap} (Artículo puede repetirse)", createDto.OtSap);

                    return new MaquinaDto
                    {
                        Articulo = createDto.Articulo,
                        NumeroMaquina = createDto.NumeroMaquina,
                        OtSap = createDto.OtSap,
                        Cliente = createDto.Cliente,
                        Referencia = createDto.Referencia ?? string.Empty,
                        Td = createDto.Td ?? string.Empty,
                        NumeroColores = createDto.Colores.Count,
                        Colores = createDto.Colores,
                        Kilos = createDto.Kilos,
                        FechaTintaEnMaquina = fechaTinta,
                        Sustrato = createDto.Sustrato,
                        Estado = estadoFinal ?? "SIN_ASIGNAR",
                        Observaciones = createDto.Observaciones,
                        CreatedBy = userId,
                        UpdatedBy = userId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                }
                else
                {
                    // Insertar nuevo registro (OT SAP no existe)
                    using var insertCommand = connection.CreateCommand();
                    insertCommand.CommandText = @"
                        INSERT INTO maquinas (
                            articulo, numero_maquina, ot_sap, cliente, referencia, td,
                            numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
                            estado, observaciones, created_by, updated_by, created_at, updated_at
                        ) VALUES (
                            @articulo, @numeroMaquina, @otSap, @cliente, @referencia, @td,
                            @numeroColores, @colores, @kilos, @fechaTinta, @sustrato,
                            @estado, @observaciones, @createdBy, @updatedBy, @createdAt, @updatedAt
                        )";

                    insertCommand.Parameters.AddWithValue("@articulo", createDto.Articulo);
                    insertCommand.Parameters.AddWithValue("@numeroMaquina", createDto.NumeroMaquina);
                    insertCommand.Parameters.AddWithValue("@otSap", createDto.OtSap);
                    insertCommand.Parameters.AddWithValue("@cliente", createDto.Cliente);
                    insertCommand.Parameters.AddWithValue("@referencia", createDto.Referencia ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@td", createDto.Td ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@numeroColores", createDto.Colores.Count);
                    insertCommand.Parameters.AddWithValue("@colores", coloresJson);
                    insertCommand.Parameters.AddWithValue("@kilos", createDto.Kilos);
                    insertCommand.Parameters.AddWithValue("@fechaTinta", fechaTinta);
                    insertCommand.Parameters.AddWithValue("@sustrato", createDto.Sustrato);
                    insertCommand.Parameters.AddWithValue("@estado", string.IsNullOrWhiteSpace(createDto.Estado) ? (object)DBNull.Value : createDto.Estado);
                    insertCommand.Parameters.AddWithValue("@observaciones", createDto.Observaciones ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@createdBy", userId ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@updatedBy", userId ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@createdAt", DateTime.UtcNow);
                    insertCommand.Parameters.AddWithValue("@updatedAt", DateTime.UtcNow);

                    await insertCommand.ExecuteNonQueryAsync();

                    _logger.LogInformation("✅ Registro creado: OT={OtSap}, Artículo={Articulo}, Máquina={Maquina}", 
                        createDto.OtSap, createDto.Articulo, createDto.NumeroMaquina);

                    return new MaquinaDto
                    {
                        Articulo = createDto.Articulo,
                        NumeroMaquina = createDto.NumeroMaquina,
                        OtSap = createDto.OtSap,
                        Cliente = createDto.Cliente,
                        Referencia = createDto.Referencia ?? string.Empty,
                        Td = createDto.Td ?? string.Empty,
                        NumeroColores = createDto.Colores.Count,
                        Colores = createDto.Colores,
                        Kilos = createDto.Kilos,
                        FechaTintaEnMaquina = fechaTinta,
                        Sustrato = createDto.Sustrato,
                        Estado = createDto.Estado ?? "SIN_ASIGNAR",
                        Observaciones = createDto.Observaciones,
                        CreatedBy = userId,
                        UpdatedBy = userId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando/actualizando registro: {Articulo}", createDto.Articulo);
                throw;
            }
        }

        public async Task<MaquinaDto> UpdateAsync(string otSap, UpdateMaquinaDto updateDto, int? userId)
        {
            var existing = await _repository.GetByOtSapAsync(otSap);
            if (existing == null)
            {
                // Fallback: try by articulo if provided in DTO
                if (!string.IsNullOrEmpty(updateDto.Articulo))
                {
                    existing = await _repository.GetByArticuloAsync(updateDto.Articulo);
                }
                
                if (existing == null)
                {
                    throw new KeyNotFoundException($"Máquina con OT SAP {otSap} no encontrada");
                }
            }

            if (updateDto.NumeroMaquina.HasValue)
                existing.NumeroMaquina = updateDto.NumeroMaquina.Value;

            if (!string.IsNullOrEmpty(updateDto.OtSap))
                existing.OtSap = updateDto.OtSap;

            if (!string.IsNullOrEmpty(updateDto.Cliente))
                existing.Cliente = updateDto.Cliente;

            if (!string.IsNullOrEmpty(updateDto.Referencia))
                existing.Referencia = updateDto.Referencia;

            if (!string.IsNullOrEmpty(updateDto.Td))
                existing.Td = updateDto.Td;

            if (updateDto.Colores != null && updateDto.Colores.Any())
                existing.SetColoresArray(updateDto.Colores.ToArray());

            if (updateDto.Kilos.HasValue)
                existing.Kilos = updateDto.Kilos.Value;

            if (updateDto.FechaTintaEnMaquina.HasValue)
                existing.FechaTintaEnMaquina = updateDto.FechaTintaEnMaquina.Value;

            if (!string.IsNullOrEmpty(updateDto.Sustrato))
                existing.Sustrato = updateDto.Sustrato;

            if (!string.IsNullOrEmpty(updateDto.Estado))
                existing.Estado = updateDto.Estado;

            if (updateDto.Observaciones != null)
                existing.Observaciones = updateDto.Observaciones;

            existing.UpdatedBy = userId;
            existing.LastActionBy = userId?.ToString();
            existing.LastActionAt = DateTime.UtcNow;

            var updated = await _repository.UpdateAsync(existing);
            return MapToDto(updated);
        }

        public async Task<MaquinaDto> UpdateMachineStatusAsync(string otSap, string estado, string? observaciones, int? userId, string? userName)
        {
            var existing = await _repository.GetByOtSapAsync(otSap);
            if (existing == null)
            {
                throw new KeyNotFoundException($"Máquina con OT SAP {otSap} no encontrada");
            }

            // Guardar estado anterior para auditoría
            var oldStatus = existing.Estado;
            var oldObservaciones = existing.Observaciones;
            DateTime? startTime = existing.PreparandoStartedAt;

            // Validar estado
            var estadosValidos = new[] { "SIN_ASIGNAR", "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO", "EN_PROCESO" };
            var estadoUpper = estado?.ToUpper();
            
            if (!estadosValidos.Contains(estadoUpper))
            {
                throw new ArgumentException($"Estado inválido: {estado}. Estados válidos: {string.Join(", ", estadosValidos)}");
            }

            // Normalizar estado
            if (estadoUpper == "EN_PROCESO")
            {
                estadoUpper = "CORRIENDO";
            }

            // Guardar fecha cuando se marca como PREPARANDO
            if (estadoUpper == "PREPARANDO" && existing.Estado != "PREPARANDO")
            {
                existing.PreparandoStartedAt = DateTime.UtcNow;
                _logger.LogInformation("⏱️ Guardando PreparandoStartedAt para OT={OtSap}", otSap);
            }
            
            // Calcular duración si cambia de PREPARANDO a LISTO
            TimeSpan? duration = null;
            if (existing.Estado == "PREPARANDO" && estadoUpper == "LISTO" && existing.PreparandoStartedAt.HasValue)
            {
                duration = DateTime.UtcNow - existing.PreparandoStartedAt.Value;
                _logger.LogInformation("⏱️ Duración PREPARANDO->LISTO para OT={OtSap}: {Duration}", otSap, duration);
                
                // NO limpiar PreparandoStartedAt cuando cambia a LISTO
                // Mantenerlo para que el frontend pueda calcular el tiempo
                // Solo se limpiará cuando cambie a CORRIENDO, SUSPENDIDO o TERMINADO
            }
            
            // Limpiar PreparandoStartedAt cuando cambia a CORRIENDO, SUSPENDIDO o TERMINADO
            if (existing.Estado == "PREPARANDO" && (estadoUpper == "CORRIENDO" || estadoUpper == "SUSPENDIDO" || estadoUpper == "TERMINADO"))
            {
                _logger.LogInformation("⏱️ Limpiando PreparandoStartedAt para OT={OtSap} (cambio de PREPARANDO a {Estado})", otSap, estadoUpper);
                existing.PreparandoStartedAt = null;
            }
            
            // También limpiar cuando cambia de LISTO a otro estado
            if (existing.Estado == "LISTO" && estadoUpper != "LISTO" && estadoUpper != "PREPARANDO")
            {
                _logger.LogInformation("⏱️ Limpiando PreparandoStartedAt para OT={OtSap} (cambio de LISTO a {Estado})", otSap, estadoUpper);
                existing.PreparandoStartedAt = null;
            }

            existing.Estado = estadoUpper;
            
            if (observaciones != null)
            {
                existing.Observaciones = observaciones;
            }

            existing.UpdatedBy = userId;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.LastActionBy = userName ?? "Sistema";
            existing.LastActionAt = DateTime.UtcNow;

            var updated = await _repository.UpdateAsync(existing);
            _logger.LogInformation("✅ Estado actualizado: OT={OtSap}, Estado={Estado}, Usuario={User}", otSap, estadoUpper, userName);
            
            // ✅ Registrar actividad detallada en auditoría
            try
            {
                var description = $"Cambio de estado: {oldStatus} → {estadoUpper}";
                if (duration.HasValue)
                {
                    description += $" (Duración: {duration.Value.TotalMinutes:F2} min)";
                }

                await _activityLogger.LogDetailedActivityAsync(
                    action: "MACHINE_STATUS_CHANGED",
                    description: description,
                    module: "MACHINES",
                    entityType: "Maquina",
                    entityId: null, // No tenemos ID numérico, usamos OT SAP en EntityName
                    entityName: $"{otSap} - {existing.Articulo}",
                    duration: duration,
                    oldValues: new { estado = oldStatus, observaciones = oldObservaciones },
                    newValues: new { estado = estadoUpper, observaciones = existing.Observaciones },
                    details: $"{{\"otSap\":\"{otSap}\",\"articulo\":\"{existing.Articulo}\",\"descripcion\":\"{existing.Referencia}\",\"maquina\":{existing.NumeroMaquina}}}"
                );
            }
            catch (Exception logEx)
            {
                _logger.LogWarning(logEx, "Error al registrar actividad de máquina");
            }
            
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(string otSap)
        {
            return await _repository.DeleteAsync(otSap);
        }

        public async Task<ExcelProcessResultDto> ProcessExcelFileAsync(IFormFile file, int? userId)
        {
            try
            {
                _logger.LogInformation("🔄 Procesando archivo: {FileName} ({FileSize} bytes)", file.FileName, file.Length);

                var programs = new List<MaquinaDto>();
                var validationErrors = new List<string>();

                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);
                
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                if (worksheet == null || worksheet.Dimension == null || worksheet.Dimension.Rows < 2)
                {
                    return new ExcelProcessResultDto { Success = false, ErrorMessage = "Archivo inválido o sin datos." };
                }

                // Leer líneas de datos
                var dataLines = new List<string>();
                for (int row = 2; row <= worksheet.Dimension.Rows; row++)
                {
                    var rowData = new List<string>();
                    for (int col = 2; col <= worksheet.Dimension.Columns; col++)
                    {
                        rowData.Add(worksheet.Cells[row, col].Text ?? "");
                    }
                    if (rowData.All(string.IsNullOrWhiteSpace)) continue;
                    
                    var csvLine = string.Join(",", rowData.Select(v => $"\"{v}\""));
                    dataLines.Add(csvLine);
                }

                // 1. Parsear y Validar DTOs
                var dtos = new List<CreateMaquinaDto>();
                foreach (var dataLine in dataLines)
                {
                    try
                    {
                        var dto = await ParseExcelLine(dataLine, userId);
                        if (dto != null) dtos.Add(dto);
                    }
                    catch (Exception ex)
                    {
                        validationErrors.Add($"Error en línea: {ex.Message}");
                    }
                }

                // 2. Deduplicar por OT SAP (mantener último)
                var uniqueDtos = dtos.GroupBy(d => d.OtSap).Select(g => g.Last()).ToList();

                // 3. Operaciones en Base de Datos
                
                // 3.0 Limpiar duplicados previos (para evitar errores de unicidad)
                await CleanExistingOtSapDuplicatesAsync();

                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                // 3.1 Obtener programas existentes
                var existingPrograms = new List<(string Articulo, string OtSap, string Estado)>();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "SELECT articulo, ot_sap, estado FROM maquinas";
                    using var reader = await cmd.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        existingPrograms.Add((
                            reader.IsDBNull(0) ? "" : reader.GetString(0),
                            reader.IsDBNull(1) ? "" : reader.GetString(1),
                            reader.IsDBNull(2) ? "" : reader.GetString(2)
                        ));
                    }
                }
                
                _logger.LogInformation("📊 Total registros existentes en DB: {Count}", existingPrograms.Count);

                // 3.2 Identificar Eliminaciones (CORRIENDO y SIN_ASIGNAR)
                // Mantener: PREPARANDO, LISTO, SUSPENDIDO
                // CORRIENDO se elimina para ser reemplazado por la nueva programación
                var statesToKeep = new[] { "PREPARANDO", "LISTO", "SUSPENDIDO" };
                
                // Normalizar estados para comparación segura
                bool IsProtectedState(string estado)
                {
                    if (string.IsNullOrWhiteSpace(estado)) return false;
                    return statesToKeep.Contains(estado.Trim().ToUpper());
                }
                
                // Usar OT_SAP para la eliminación
                var otSapsToDelete = existingPrograms
                    .Where(p => !IsProtectedState(p.Estado)) // Esto incluye "CORRIENDO", "SIN_ASIGNAR", "", null
                    .Select(p => p.OtSap)
                    .Where(ot => !string.IsNullOrEmpty(ot)) // Asegurar que no borremos cosas sin OT
                    .ToList();
                
                // Log de diagnóstico
                var estadosEncontrados = existingPrograms.Select(p => p.Estado).Distinct().ToList();
                _logger.LogInformation("🔍 Estados encontrados en DB: {Estados}", string.Join(", ", estadosEncontrados));
                _logger.LogInformation("🗑️ Registros identificados para eliminar: {Count}", otSapsToDelete.Count);

                if (otSapsToDelete.Any())
                {
                    using var delCmd = connection.CreateCommand();
                    // Usar parámetros para evitar inyección SQL y manejar listas grandes
                    const int BatchSize = 1000;
                    for (int i = 0; i < otSapsToDelete.Count; i += BatchSize)
                    {
                        var batch = otSapsToDelete.Skip(i).Take(BatchSize).ToList();
                        var paramNames = batch.Select((id, idx) => $"@ot{idx}").ToList();
                        
                        delCmd.CommandText = $"DELETE FROM maquinas WHERE ot_sap IN ({string.Join(",", paramNames)})";
                        delCmd.Parameters.Clear();
                        
                        for (int j = 0; j < batch.Count; j++)
                        {
                            delCmd.Parameters.AddWithValue(paramNames[j], batch[j]);
                        }
                        
                        var deletedCount = await delCmd.ExecuteNonQueryAsync();
                        _logger.LogInformation("⚡ Batch eliminado: {Count} registros", deletedCount);
                    }
                    
                    _logger.LogInformation("✅ Eliminación completada. Total: {Count}", otSapsToDelete.Count);
                }

                // 3.3 Upsert (Insertar o Actualizar)
                foreach (var dto in uniqueDtos)
                {
                    // Buscar coincidencia en registros que SE MANTUVIERON
                    // Nota: existingPrograms todavía tiene los registros que acabamos de borrar, 
                    // así que debemos filtrar también aquí para no intentar actualizar algo que ya no existe.
                    var existingMatch = existingPrograms
                        .FirstOrDefault(p => p.OtSap == dto.OtSap && IsProtectedState(p.Estado));

                    if (!string.IsNullOrEmpty(existingMatch.OtSap)) // Si encontró coincidencia válida y protegida
                    {
                        // ACTUALIZAR (Mantener estado)
                        _logger.LogInformation("♻️ Actualizando registro protegido: {OtSap} (Estado: {Estado})", existingMatch.OtSap, existingMatch.Estado);
                        
                        using var updateCmd = connection.CreateCommand();
                        updateCmd.CommandText = @"
                            UPDATE maquinas SET 
                                articulo=@articulo, numero_maquina=@num, cliente=@cliente, 
                                referencia=@ref, td=@td, numero_colores=@nc, colores=@col, 
                                kilos=@kilos, fecha_tinta_en_maquina=@fecha, sustrato=@sust, 
                                observaciones=@obs, updated_by=@upd, updated_at=@now
                            WHERE ot_sap=@otSap"; // Usar OT_SAP para update seguro

                        updateCmd.Parameters.AddWithValue("@articulo", dto.Articulo);
                        updateCmd.Parameters.AddWithValue("@num", dto.NumeroMaquina);
                        updateCmd.Parameters.AddWithValue("@cliente", dto.Cliente);
                        updateCmd.Parameters.AddWithValue("@ref", dto.Referencia ?? (object)DBNull.Value);
                        updateCmd.Parameters.AddWithValue("@td", dto.Td ?? (object)DBNull.Value);
                        updateCmd.Parameters.AddWithValue("@nc", dto.Colores.Count);
                        updateCmd.Parameters.AddWithValue("@col", JsonSerializer.Serialize(dto.Colores));
                        updateCmd.Parameters.AddWithValue("@kilos", dto.Kilos);
                        updateCmd.Parameters.AddWithValue("@fecha", dto.FechaTintaEnMaquina ?? DateTime.Now);
                        updateCmd.Parameters.AddWithValue("@sust", dto.Sustrato);
                        updateCmd.Parameters.AddWithValue("@obs", dto.Observaciones ?? (object)DBNull.Value);
                        updateCmd.Parameters.AddWithValue("@upd", userId ?? (object)DBNull.Value);
                        updateCmd.Parameters.AddWithValue("@now", DateTime.UtcNow);
                        updateCmd.Parameters.AddWithValue("@otSap", existingMatch.OtSap);

                        await updateCmd.ExecuteNonQueryAsync();
                        programs.Add(new MaquinaDto { 
                            Articulo = dto.Articulo, 
                            OtSap = dto.OtSap, 
                            NumeroMaquina = dto.NumeroMaquina, 
                            Cliente = dto.Cliente, 
                            Referencia = dto.Referencia ?? string.Empty, 
                            Td = dto.Td ?? string.Empty, 
                            Colores = dto.Colores, 
                            Kilos = dto.Kilos, 
                            FechaTintaEnMaquina = dto.FechaTintaEnMaquina ?? DateTime.Now, 
                            Sustrato = dto.Sustrato, 
                            Estado = existingMatch.Estado ?? "SIN_ASIGNAR" 
                        });
                    }
                    else
                    {
                        // INSERTAR (Estado SIN_ASIGNAR)
                        // _logger.LogInformation("➕ Insertando nuevo registro: {OtSap}", dto.OtSap);
                        dto.Estado = "SIN_ASIGNAR";
                        var created = await CreateAsync(dto, userId);
                        programs.Add(created);
                    }
                }

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
                _logger.LogError(ex, "❌ Error procesando archivo");
                return new ExcelProcessResultDto { Success = false, ErrorMessage = ex.Message };
            }
        }

        private async Task CleanExistingOtSapDuplicatesAsync()
        {
            try
            {
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                // Identificar duplicados: OT SAPs que aparecen más de una vez
                using var duplicateCommand = connection.CreateCommand();
                duplicateCommand.CommandText = @"
                    SELECT ot_sap, COUNT(*) as count, MAX(updated_at) as latest_update
                    FROM maquinas
                    GROUP BY ot_sap
                    HAVING COUNT(*) > 1";
                
                var duplicates = new List<(string OtSap, DateTime LatestUpdate)>();
                using (var reader = await duplicateCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        duplicates.Add((
                            reader.GetString("ot_sap"),
                            reader.GetDateTime("latest_update")
                        ));
                    }
                }

                if (!duplicates.Any()) return;

                _logger.LogInformation("🧹 Encontrados {Count} OT SAPs duplicados. Limpiando...", duplicates.Count);

                foreach (var (otSap, latestUpdate) in duplicates)
                {
                    // Eliminar todos los registros con este OT SAP excepto el más reciente
                    // Nota: Si hay varios con el mismo updated_at más reciente, esto podría dejar duplicados.
                    // Para ser más seguros, podríamos usar ID si existiera de forma confiable, pero ot_sap + updated_at es lo mejor que tenemos ahora.
                    // Una estrategia mejor: obtener todos los IDs (si existen) o usar LIMIT en delete.
                    
                    // Estrategia: Borrar los que NO coinciden con la fecha más reciente
                    using var deleteCommand = connection.CreateCommand();
                    deleteCommand.CommandText = @"
                        DELETE FROM maquinas 
                        WHERE ot_sap = @otSap 
                        AND (updated_at < @latestUpdate OR updated_at IS NULL)";
                    
                    deleteCommand.Parameters.AddWithValue("@otSap", otSap);
                    deleteCommand.Parameters.AddWithValue("@latestUpdate", latestUpdate);
                    
                    var deleted = await deleteCommand.ExecuteNonQueryAsync();
                    
                    // Si aún quedan duplicados (misma fecha), borrar arbitrariamente dejando 1
                    using var checkCmd = connection.CreateCommand();
                    checkCmd.CommandText = "SELECT COUNT(*) FROM maquinas WHERE ot_sap = @otSap";
                    checkCmd.Parameters.AddWithValue("@otSap", otSap);
                    var count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                    
                    if (count > 1)
                    {
                        // Borrar excedentes dejando solo 1 (usando LIMIT)
                        using var cleanupCmd = connection.CreateCommand();
                        cleanupCmd.CommandText = $"DELETE FROM maquinas WHERE ot_sap = @otSap LIMIT {count - 1}";
                        cleanupCmd.Parameters.AddWithValue("@otSap", otSap);
                        await cleanupCmd.ExecuteNonQueryAsync();
                    }
                }
                
                _logger.LogInformation("✅ Limpieza de duplicados completada.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error limpiando duplicados de OT SAP");
                // No lanzamos excepción para no interrumpir el flujo principal, solo logueamos
            }
        }

        // ===== MÉTODO PRIVADO PARA PARSEAR UNA LÍNEA DEL ARCHIVO EXCEL =====
        // Este método toma una línea del archivo Excel (en formato CSV) y la convierte en un objeto CreateMaquinaDto
        // Retorna: CreateMaquinaDto con los datos procesados o null si hay error
        private async Task<CreateMaquinaDto?> ParseExcelLine(string line, int? userId)
        {
            // ===== PASO 1: PARSEAR LA LÍNEA CSV EN COLUMNAS =====
            // Llamar al método ParseCsvLine que convierte la línea CSV en un array de strings
            // Este método maneja correctamente las comillas y comas dentro de valores
            var columns = ParseCsvLine(line);
            
            // ===== PASO 2: LOG DE INFORMACIÓN DE LA LÍNEA =====
            // Registrar en el log cuántas columnas se encontraron en esta línea para debugging
            _logger.LogInformation("📋 Procesando línea con {Count} columnas", columns.Count);
            
            // Registrar el contenido de cada columna con su índice para facilitar el debugging
            // Formato: [0]=valor1 | [1]=valor2 | [2]=valor3 ...
            _logger.LogInformation("📋 Datos: {Data}", string.Join(" | ", columns.Select((c, i) => $"[{i}]={c}")));
            
            // ===== PASO 3: VALIDACIÓN DEL NÚMERO DE COLUMNAS =====
            // Verificar que el archivo tenga al menos 10 columnas según el formato esperado
            // Si tiene menos columnas, el archivo no es válido y se debe rechazar
            if (columns.Count < 10)
            {
                // Construir un mensaje de error detallado que explique el formato esperado
                // Este mensaje ayuda al usuario a corregir el archivo Excel
                var errorMsg = $"Formato inválido: Se esperan al menos 10 columnas (B-K), se encontraron {columns.Count}.\n" +
                              $"Columnas esperadas:\n" +
                              $"B: MQ IMP (Número de máquina impresora)\n" +
                              $"C: ARTICULO F (Código del artículo)\n" +
                              $"D: OT SAP (Orden de trabajo)\n" +
                              $"E: CLIENTE (Nombre del cliente)\n" +
                              $"F: REFERENCIA (Referencia del producto)\n" +
                              $"G: TD (Tipo de diseño)\n" +
                              $"H: NUMERO DE COLORES (Cantidad de colores)\n" +
                              $"I: KILOS (Cantidad en kilogramos)\n" +
                              $"J: COLORES EN MAQUINA (Fecha de preparación - ej: '10-nov-25 05 PM')\n" +
                              $"K: SUSTRATOS (Tipo de material)";
                
                // Lanzar excepción con el mensaje de error para detener el procesamiento
                throw new ArgumentException(errorMsg);
            }
            
            // ===== PASO 4: VALIDACIÓN DE CAMPOS OBLIGATORIOS =====
            // Verificar que el campo ARTICULO F (columna 1) no esté vacío
            // Este campo es la clave primaria y debe ser único y obligatorio
            if (string.IsNullOrWhiteSpace(columns[1]))
            {
                // Lanzar excepción si el artículo está vacío
                throw new ArgumentException("El campo ARTICULO F (columna C) es obligatorio y no puede estar vacío");
            }
            
            // Verificar que el campo OT SAP (columna 2) no esté vacío
            // La orden de trabajo es obligatoria para identificar el trabajo
            if (string.IsNullOrWhiteSpace(columns[2]))
            {
                // Lanzar excepción si la OT SAP está vacía
                throw new ArgumentException("El campo OT SAP (columna D) es obligatorio y no puede estar vacío");
            }
            
            // Verificar que el campo CLIENTE (columna 3) no esté vacío
            // El nombre del cliente es obligatorio para la trazabilidad
            if (string.IsNullOrWhiteSpace(columns[3]))
            {
                // Lanzar excepción si el cliente está vacío
                throw new ArgumentException("El campo CLIENTE (columna E) es obligatorio y no puede estar vacío");
            }

            // ===== PASO 4B: CONSULTAR TABLA DE DISEÑO PARA OBTENER INFORMACIÓN DEL ARTÍCULO =====
            // Buscar el artículo en la tabla de diseño (designs) usando el código de artículo (columna 1)
            // Si el artículo existe en la tabla de diseño, usaremos esa información
            // Si NO existe, usaremos la información del Excel
            _logger.LogInformation("🔍 Buscando artículo '{Articulo}' en tabla de diseño...", columns[1]);
            
            // Declarar variable para almacenar el diseño encontrado (null si no existe)
            Design? designFromTable = null;
            
            try
            {
                // Log del artículo que se está buscando (con trim para eliminar espacios)
                var articuloBuscar = columns[1].Trim();
                _logger.LogInformation("🔍 Buscando artículo exacto: '{Articulo}' (longitud: {Length})", articuloBuscar, articuloBuscar.Length);
                
                // Contar cuántos diseños hay en total en la tabla
                var totalDesigns = await _context.Designs.CountAsync();
                _logger.LogInformation("📊 Total de diseños en tabla: {Total}", totalDesigns);
                
                // Intentar buscar el diseño en la base de datos usando el código de artículo
                // Usamos el contexto de base de datos directamente para consultar la tabla designs
                designFromTable = await _context.Designs
                    .Where(d => d.ArticleF == articuloBuscar) // Filtrar por código de artículo (ArticleF) con trim
                    .FirstOrDefaultAsync(); // Obtener el primer resultado o null si no existe
                
                // Verificar si se encontró el diseño en la tabla
                if (designFromTable != null)
                {
                    // Si se encontró, registrar en el log que se usará la información de la tabla de diseño
                    _logger.LogInformation("✅ Artículo '{Articulo}' encontrado en tabla de diseño - Se usará información de diseño", articuloBuscar);
                    _logger.LogInformation("📋 Diseño encontrado: ID={Id}, Cliente={Cliente}, Sustrato={Sustrato}, Colores={NumColores}", 
                        designFromTable.Id, designFromTable.Client, designFromTable.Substrate, designFromTable.ColorCount);
                    _logger.LogInformation("🎨 Colores del diseño: C1={C1}, C2={C2}, C3={C3}, C4={C4}", 
                        designFromTable.Color1, designFromTable.Color2, designFromTable.Color3, designFromTable.Color4);
                }
                else
                {
                    // Si NO se encontró, registrar en el log que se usará la información del Excel
                    _logger.LogInformation("⚠️ Artículo '{Articulo}' NO encontrado en tabla de diseño - Se usará información del Excel", articuloBuscar);
                    
                    // Mostrar algunos artículos de ejemplo de la tabla para debugging
                    var ejemplosArticulos = await _context.Designs
                        .Select(d => d.ArticleF)
                        .Take(5)
                        .ToListAsync();
                    _logger.LogInformation("📋 Ejemplos de artículos en tabla designs: {Ejemplos}", string.Join(", ", ejemplosArticulos));
                }
            }
            catch (Exception ex)
            {
                // Si hay error al consultar la base de datos, registrar el error y continuar con datos del Excel
                _logger.LogWarning(ex, "⚠️ Error consultando tabla de diseño para artículo '{Articulo}' - Se usará información del Excel", columns[1]);
                designFromTable = null; // Asegurar que sea null para usar datos del Excel
            }

            // ===== DOCUMENTACIÓN: FORMATO CORRECTO DEL ARCHIVO (10 COLUMNAS) =====
            // Columna 0: MQ IMP - Número de máquina impresora (11-21)
            // Columna 1: ARTICULO F - Código del artículo (único, clave primaria)
            // Columna 2: OT SAP - Orden de trabajo SAP
            // Columna 3: CLIENTE - Nombre del cliente
            // Columna 4: REFERENCIA - Referencia del producto
            // Columna 5: TD - Código TD (Tipo de Diseño)
            // Columna 6: NUMERO DE COLORES - Cantidad de colores (1-10)
            // Columna 7: KILOS - Cantidad en kilogramos
            // Columna 8: COLORES EN MAQUINA - Fecha y hora en que deben estar listos los colores (ej: "10-nov-25 05 PM")
            //            IMPORTANTE: Esta columna contiene la FECHA Y HORA LÍMITE para tener los colores preparados
            //            NO contiene los nombres de los colores
            // Columna 9: SUSTRATOS - Tipo de material base (ej: BOPP, PE, PET)

            // ===== PASO 5: PARSEAR NÚMERO DE MÁQUINA (COLUMNA 0) =====
            // Declarar variable para almacenar el número de máquina con valor por defecto 11
            int numeroMaquina = 11;
            
            // Intentar convertir el valor de la columna 0 a número entero
            if (int.TryParse(columns[0], out var machine))
            {
                // Si la conversión es exitosa, usar el valor parseado
                numeroMaquina = machine;
                // Registrar en el log el número de máquina parseado
                _logger.LogInformation("🖨️ Máquina impresora: {Machine}", numeroMaquina);
            }
            else
            {
                // Si la conversión falla, registrar advertencia y usar valor por defecto (11)
                _logger.LogWarning("⚠️ No se pudo parsear número de máquina '{Machine}', usando 11 por defecto", columns[0]);
            }

            // ===== PASO 6: PARSEAR NÚMERO DE COLORES (COLUMNA 6) =====
            // Declarar variable para almacenar la cantidad de colores con valor inicial 0
            int numeroColores = 0;
            
            // Intentar convertir el valor de la columna 6 a número entero
            if (int.TryParse(columns[6], out var numCol))
            {
                // Si la conversión es exitosa, usar el valor parseado
                numeroColores = numCol;
                // Registrar en el log la cantidad de colores parseada
                _logger.LogInformation("🎨 Número de colores: {Count}", numeroColores);
            }
            else
            {
                // Si la conversión falla, registrar advertencia y usar 0 por defecto
                _logger.LogWarning("⚠️ No se pudo parsear número de colores '{NumColores}', usando 0", columns[6]);
            }

            // ===== PASO 7: PARSEAR FECHA LÍMITE PARA COLORES (COLUMNA 8) =====
            // La columna 8 "COLORES EN MAQUINA" contiene la FECHA Y HORA LÍMITE en que deben estar listos los colores
            // Formato esperado: "10-nov-25 05 PM" o "dd-MMM-yy hh tt"
            // Esta es la fecha objetivo para tener los colores preparados en la máquina
            // Declarar variable para almacenar la fecha límite de preparación de colores
            DateTime? fechaTintaEnMaquina = null;
            
            // Registrar en el log el valor original de la fecha antes de procesarlo
            _logger.LogInformation("📅 Parseando fecha límite para colores - Valor original: '{Fecha}' (columna J)", columns[8]);
            
            // Verificar si la columna 8 tiene contenido (no está vacía ni es solo espacios)
            if (!string.IsNullOrWhiteSpace(columns[8]))
            {
                // Intentar parsear la fecha usando DateTime.TryParse
                // Este método intenta automáticamente varios formatos de fecha comunes
                if (DateTime.TryParse(columns[8], out var fecha))
                {
                    // Si la conversión es exitosa, usar la fecha parseada
                    fechaTintaEnMaquina = fecha;
                    // Registrar en el log la fecha límite parseada exitosamente
                    _logger.LogInformation("✅ Fecha límite para colores parseada exitosamente (columna J): {Fecha}", fechaTintaEnMaquina);
                }
                else
                {
                    // Si la conversión falla, usar la fecha actual como fallback
                    fechaTintaEnMaquina = DateTime.Now;
                    // Registrar advertencia indicando que no se pudo parsear la fecha
                    _logger.LogWarning("⚠️ No se pudo parsear la fecha límite (columna J) '{Fecha}', usando fecha actual", columns[8]);
                }
            }
            else
            {
                // Si la columna 8 está vacía, usar la fecha actual
                fechaTintaEnMaquina = DateTime.Now;
                // Registrar advertencia indicando que la fecha está vacía
                _logger.LogWarning("⚠️ Fecha límite para colores vacía (columna J), usando fecha actual");
            }
            
            // ===== PASO 7B: OBTENER COLORES (DESDE TABLA DE DISEÑO O GENÉRICOS) =====
            // NUEVA LÓGICA: Si el artículo existe en la tabla de diseño, usar esos colores
            // Si NO existe, generar colores genéricos
            var colores = new List<string>();
            
            // Verificar si se encontró el diseño en la tabla de diseño
            if (designFromTable != null)
            {
                // ===== USAR COLORES DE LA TABLA DE DISEÑO =====
                _logger.LogInformation("🎨 Usando colores de la tabla de diseño para artículo '{Articulo}'", columns[1]);
                
                // Extraer los colores del diseño (Color1, Color2, ..., Color10)
                // Solo agregar colores que no sean null o vacíos
                if (!string.IsNullOrWhiteSpace(designFromTable.Color1)) colores.Add(designFromTable.Color1);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color2)) colores.Add(designFromTable.Color2);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color3)) colores.Add(designFromTable.Color3);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color4)) colores.Add(designFromTable.Color4);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color5)) colores.Add(designFromTable.Color5);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color6)) colores.Add(designFromTable.Color6);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color7)) colores.Add(designFromTable.Color7);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color8)) colores.Add(designFromTable.Color8);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color9)) colores.Add(designFromTable.Color9);
                if (!string.IsNullOrWhiteSpace(designFromTable.Color10)) colores.Add(designFromTable.Color10);
                
                // Registrar en el log los colores obtenidos de la tabla de diseño
                _logger.LogInformation("✅ Colores de tabla de diseño: {Colores}", string.Join(", ", colores));
            }
            else
            {
                // ===== GENERAR COLORES GENÉRICOS =====
                // Como el artículo NO está en la tabla de diseño, generar nombres genéricos
                _logger.LogInformation("🎨 Generando colores genéricos para artículo '{Articulo}'", columns[1]);
                
                // Usar un bucle for para crear colores genéricos basados en el número de colores (columna 6)
                for (int i = 0; i < numeroColores; i++)
                {
                    // Agregar color genérico con formato "COLOR1", "COLOR2", "COLOR3", etc.
                    colores.Add($"COLOR{i + 1}");
                }
                
                // Registrar en el log los colores genéricos creados
                _logger.LogInformation("✅ Colores genéricos creados: {Colores}", string.Join(", ", colores));
            }

            // ===== PASO 8: PARSEAR KILOS (COLUMNA 7) =====
            // Los kilos pueden venir con coma (,) o punto (.) como separador decimal
            // Declarar variable para almacenar los kilos con valor inicial 0
            decimal kilos = 0;
            
            // Registrar en el log el valor original de kilos antes de procesarlo
            _logger.LogInformation("🔍 Parseando KILOS - Valor original: '{Kilos}' (columna I)", columns[7]);
            
            // Verificar si la columna 7 tiene contenido (no está vacía ni es solo espacios)
            if (!string.IsNullOrWhiteSpace(columns[7]))
            {
                // Limpiar el valor de kilos:
                // 1. Replace(",", "."): Reemplazar coma por punto para formato decimal estándar
                // 2. Replace(" ", ""): Eliminar todos los espacios
                // 3. Trim(): Eliminar espacios al inicio y final
                var kilosStr = columns[7]
                    .Replace(",", ".")
                    .Replace(" ", "")
                    .Trim();
                
                // Registrar en el log el valor de kilos después de la limpieza
                _logger.LogInformation("🔍 KILOS después de limpieza (columna I): '{KilosLimpio}'", kilosStr);
                
                // Intentar convertir el valor limpio a decimal usando cultura invariante
                // NumberStyles.Any: Acepta cualquier formato numérico válido
                // InvariantCulture: Usa punto como separador decimal
                if (decimal.TryParse(kilosStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out kilos))
                {
                    // Si la conversión es exitosa, registrar el valor parseado
                    _logger.LogInformation("✅ KILOS parseados exitosamente (columna I): {Kilos}", kilos);
                }
                else
                {
                    // Si la conversión falla, registrar advertencia y usar 0 por defecto
                    _logger.LogWarning("⚠️ No se pudo parsear KILOS (columna I) '{Kilos}', usando 0", columns[7]);
                    kilos = 0;
                }
            }
            else
            {
                // Si la columna de kilos está vacía, registrar advertencia y usar 0
                _logger.LogWarning("⚠️ Columna de KILOS vacía (columna I), usando 0");
                kilos = 0;
            }

            // ===== PASO 9: VALIDAR FECHA LÍMITE PARA COLORES =====
            // La fecha ya fue parseada en el PASO 7 desde la columna 8
            // Aquí solo validamos que tengamos una fecha válida
            if (!fechaTintaEnMaquina.HasValue)
            {
                // Si por alguna razón no hay fecha, usar la fecha actual como fallback
                fechaTintaEnMaquina = DateTime.Now;
                // Registrar advertencia
                _logger.LogWarning("⚠️ No hay fecha límite válida, usando fecha actual");
            }
            
            // Registrar en el log la fecha final que se usará
            _logger.LogInformation("📅 Fecha límite para colores en máquina: {Fecha}", fechaTintaEnMaquina);

            // ===== PASO 10: CREAR DTO CON LOS DATOS PROCESADOS =====
            // Crear un objeto CreateMaquinaDto con todos los datos parseados y validados
            // NUEVA LÓGICA: Si el artículo existe en la tabla de diseño, usar esa información
            // Si NO existe, usar la información del Excel
            // Este DTO se usará para crear o actualizar el registro en la base de datos
            
            // Determinar qué información usar para cada campo
            // REGLA: Si el artículo está en la tabla de diseño, usar esa información
            //        Si NO está, usar la información del Excel
            
            // ===== CLIENTE: Usar tabla de diseño si existe, sino Excel =====
            string clienteFinal = designFromTable != null && !string.IsNullOrWhiteSpace(designFromTable.Client)
                ? designFromTable.Client  // Usar cliente de la tabla de diseño
                : columns[3];             // Usar cliente del Excel (columna 3)
            
            // ===== SUSTRATO: Usar tabla de diseño si existe, sino Excel =====
            string sustratoFinal = designFromTable != null && !string.IsNullOrWhiteSpace(designFromTable.Substrate)
                ? designFromTable.Substrate  // Usar sustrato de la tabla de diseño
                : columns[9];                // Usar sustrato del Excel (columna 9)
            
            // ===== REFERENCIA: Usar tabla de diseño si existe, sino Excel =====
            string referenciaFinal = designFromTable != null && !string.IsNullOrWhiteSpace(designFromTable.Description)
                ? designFromTable.Description  // Usar descripción de la tabla de diseño como referencia
                : columns[4];                  // Usar referencia del Excel (columna 4)
            
            // ===== TD: SIEMPRE usar del Excel (solicitud de usuario) =====
            // Se ignora la tabla de diseño para este campo específico
            string tdFinal = columns[5];
            
            // Registrar en el log qué información se está usando
            if (designFromTable != null)
            {
                _logger.LogInformation("📋 Usando información de TABLA DE DISEÑO: Cliente={Cliente}, Sustrato={Sustrato}, Referencia={Ref}, TD={Td}", 
                    clienteFinal, sustratoFinal, referenciaFinal, tdFinal);
            }
            else
            {
                _logger.LogInformation("📋 Usando información del EXCEL: Cliente={Cliente}, Sustrato={Sustrato}, Referencia={Ref}, TD={Td}", 
                    clienteFinal, sustratoFinal, referenciaFinal, tdFinal);
            }
            
            // Crear el DTO con la información determinada
            var createDto = new CreateMaquinaDto
            {
                // Asignar número de máquina parseado de la columna 0
                NumeroMaquina = numeroMaquina,
                
                // Asignar código de artículo directamente de la columna 1 (ya validado como no vacío)
                Articulo = columns[1],
                
                // Asignar orden de trabajo SAP directamente de la columna 2 (ya validado como no vacío)
                OtSap = columns[2],
                
                // Asignar cliente (de tabla de diseño o Excel)
                Cliente = clienteFinal,
                
                // Asignar referencia (de tabla de diseño o Excel)
                Referencia = referenciaFinal,
                
                // Asignar código TD (de tabla de diseño o Excel)
                Td = tdFinal,
                
                // Asignar lista de colores (de tabla de diseño o genéricos)
                Colores = colores,
                
                // Asignar kilos parseados de la columna 7 (siempre del Excel)
                Kilos = kilos,
                
                // Asignar fecha límite para tener colores listos (columna 8) (siempre del Excel)
                FechaTintaEnMaquina = fechaTintaEnMaquina,
                
                // Asignar tipo de sustrato (de tabla de diseño o Excel)
                Sustrato = sustratoFinal,
                
                // NO asignar estado - Dejar NULL para que el operario lo asigne manualmente
                Estado = null,
                
                // Agregar observación indicando de dónde viene la información
                Observaciones = designFromTable != null 
                    ? "Programa nuevo - Información de tabla de diseño - Pendiente de asignación de estado por operario"
                    : "Programa nuevo - Información de Excel - Pendiente de asignación de estado por operario"
            };

            // ===== PASO 11: LOG DE CONFIRMACIÓN =====
            // Registrar en el log un resumen del DTO creado con los datos más importantes
            // Incluir información sobre el origen de los datos (tabla de diseño o Excel)
            string origenDatos = designFromTable != null ? "TABLA DE DISEÑO" : "EXCEL";
            _logger.LogInformation("✅ DTO creado desde {Origen}: Máquina={Machine}, Artículo={Articulo}, OT={OT}, Cliente={Cliente}, Sustrato={Sustrato}, Kilos={Kilos}, Colores={Colores}", 
                origenDatos, createDto.NumeroMaquina, createDto.Articulo, createDto.OtSap, createDto.Cliente, createDto.Sustrato, createDto.Kilos, string.Join(",", createDto.Colores));

            // ===== PASO 12: RETORNAR DTO =====
            // Retornar el DTO para ser procesado por el método principal
            return createDto;
        }

        // ===== MÉTODO PRIVADO PARA PARSEAR LÍNEA CSV =====
        // Convierte una línea CSV en un array de strings (columnas)
        // Maneja correctamente comillas y comas dentro de valores
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

            columns.Add(currentColumn.ToString().Trim());
            return columns;
        }

        public async Task<int> ClearAllProgrammingAsync(int? userId)
        {
            try
            {
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = "DELETE FROM maquinas";
                
                var rowsAffected = await command.ExecuteNonQueryAsync();
                
                _logger.LogInformation("🗑️ Programación eliminada por usuario {UserId}. Registros borrados: {Count}", userId, rowsAffected);
                
                return rowsAffected;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error eliminando programación");
                throw;
            }
        }

        public async Task<object> FixDatabaseSchemaAsync()
        {
            var result = new Dictionary<string, object>();
            var logs = new List<string>();
            result["success"] = false;
            result["logs"] = logs;

            try
            {
                logs.Add("Iniciando reparación de esquema...");
                
                var cs = _context.Database.GetConnectionString();
                using var conn = new MySqlConnector.MySqlConnection(cs);
                await conn.OpenAsync();

                // 1. Limpiar duplicados
                logs.Add("Ejecutando limpieza de duplicados...");
                await CleanExistingOtSapDuplicatesAsync();
                logs.Add("Limpieza de duplicados finalizada.");

                // 2. Verificar/Corregir PK
                using var checkPkCmd = conn.CreateCommand();
                checkPkCmd.CommandText = @"
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
                    WHERE tc.TABLE_SCHEMA = DATABASE() 
                    AND tc.TABLE_NAME = 'maquinas' 
                    AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                    AND kcu.COLUMN_NAME = 'ot_sap'";
                var otSapIsPk = Convert.ToInt32(await checkPkCmd.ExecuteScalarAsync()) > 0;

                if (!otSapIsPk)
                {
                    logs.Add("OT SAP no es PK. Corrigiendo...");
                    
                    using var cmd = conn.CreateCommand();
                    
                    // Eliminar PK existente
                    try {
                        cmd.CommandText = "ALTER TABLE maquinas DROP PRIMARY KEY";
                        await cmd.ExecuteNonQueryAsync();
                        logs.Add("PK anterior eliminada.");
                    } catch (Exception ex) {
                        logs.Add($"Nota: No se pudo eliminar PK: {ex.Message}");
                    }

                    // Eliminar columna id si existe
                    try {
                        cmd.CommandText = "ALTER TABLE maquinas DROP COLUMN id";
                        await cmd.ExecuteNonQueryAsync();
                        logs.Add("Columna id eliminada.");
                    } catch {}

                    // Establecer ot_sap como PK
                    cmd.CommandText = "ALTER TABLE maquinas MODIFY COLUMN ot_sap VARCHAR(50) NOT NULL";
                    await cmd.ExecuteNonQueryAsync();
                    
                    cmd.CommandText = "ALTER TABLE maquinas ADD PRIMARY KEY (ot_sap)";
                    await cmd.ExecuteNonQueryAsync();
                    logs.Add("PK establecida en ot_sap.");
                }
                else
                {
                    logs.Add("OT SAP ya es PK.");
                }

                result["success"] = true;
                return result;
            }
            catch (Exception ex)
            {
                logs.Add($"Error: {ex.Message}");
                _logger.LogError(ex, "Error en FixDatabaseSchemaAsync");
                return result;
            }
        }

        public async Task<object> UpdateKilosDecimalPrecisionAsync()
        {
            var result = new Dictionary<string, object>();
            var logs = new List<string>();
            result["success"] = false;
            result["logs"] = logs;

            try
            {
                logs.Add("Iniciando actualización de precisión decimal para kilos...");
                
                var cs = _context.Database.GetConnectionString();
                using var conn = new MySqlConnector.MySqlConnection(cs);
                await conn.OpenAsync();

                // Verificar estructura actual
                using var checkCmd = conn.CreateCommand();
                checkCmd.CommandText = @"
                    SELECT NUMERIC_PRECISION, NUMERIC_SCALE, COLUMN_TYPE
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'maquinas' 
                    AND COLUMN_NAME = 'kilos'";
                
                using var reader = await checkCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var precision = reader.GetInt32("NUMERIC_PRECISION");
                    var scale = reader.GetInt32("NUMERIC_SCALE");
                    var columnType = reader.GetString("COLUMN_TYPE");
                    
                    logs.Add($"Estructura actual: {columnType} (precisión: {precision}, escala: {scale})");
                    
                    if (scale >= 3)
                    {
                        logs.Add("La columna ya tiene 3 o más decimales. No se requiere migración.");
                        result["success"] = true;
                        return result;
                    }
                }
                reader.Close();

                // Actualizar columna para permitir 3 decimales
                logs.Add("Actualizando columna kilos a DECIMAL(10,3)...");
                using var updateCmd = conn.CreateCommand();
                updateCmd.CommandText = @"
                    ALTER TABLE maquinas 
                    MODIFY COLUMN kilos DECIMAL(10,3) NOT NULL 
                    COMMENT 'Cantidad en kilogramos a producir (hasta 3 decimales)'";
                
                await updateCmd.ExecuteNonQueryAsync();
                logs.Add("✅ Columna kilos actualizada exitosamente a DECIMAL(10,3)");

                // Verificar cambio aplicado
                using var verifyCmd = conn.CreateCommand();
                verifyCmd.CommandText = @"
                    SELECT NUMERIC_PRECISION, NUMERIC_SCALE, COLUMN_TYPE
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'maquinas' 
                    AND COLUMN_NAME = 'kilos'";
                
                using var verifyReader = await verifyCmd.ExecuteReaderAsync();
                if (await verifyReader.ReadAsync())
                {
                    var newColumnType = verifyReader.GetString("COLUMN_TYPE");
                    logs.Add($"✅ Verificación: Nueva estructura = {newColumnType}");
                }

                result["success"] = true;
                logs.Add("🎉 Migración completada exitosamente. Ahora se pueden guardar kilos con 3 decimales (ej: 2.234)");
                
                return result;
            }
            catch (Exception ex)
            {
                logs.Add($"❌ Error: {ex.Message}");
                _logger.LogError(ex, "Error en UpdateKilosDecimalPrecisionAsync");
                return result;
            }
        }

        private MaquinaDto MapToDto(Maquina maquina)
        {
            return new MaquinaDto
            {
                Articulo = maquina.Articulo,
                NumeroMaquina = maquina.NumeroMaquina,
                OtSap = maquina.OtSap,
                Cliente = maquina.Cliente,
                Referencia = maquina.Referencia,
                Td = maquina.Td,
                NumeroColores = maquina.NumeroColores,
                Colores = maquina.GetColoresArray().ToList(),
                Kilos = maquina.Kilos,
                FechaTintaEnMaquina = maquina.FechaTintaEnMaquina,
                Sustrato = maquina.Sustrato,
                Estado = maquina.Estado,
                Observaciones = maquina.Observaciones,
                LastActionBy = maquina.LastActionBy,
                LastActionAt = maquina.LastActionAt,
                PreparandoStartedAt = maquina.PreparandoStartedAt,
                CreatedBy = maquina.CreatedBy,
                UpdatedBy = maquina.UpdatedBy,
                CreatedAt = maquina.CreatedAt,
                UpdatedAt = maquina.UpdatedAt
            };
        }
    }
}

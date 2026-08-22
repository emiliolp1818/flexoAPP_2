using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;
using flexoAPP.Repositories;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using System.Text.Json;
using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Helpers;

namespace flexoAPP.Services
{
    public class MaquinaService : IMaquinaService
    {
        private readonly IMaquinaRepository _repository;
        private readonly ILogger<MaquinaService> _logger;
        private readonly FlexoAPPDbContext _context;
        private readonly FlexoAPP.API.Services.IActivityLoggerService _activityLogger;
        private readonly FlexoAPP.API.Services.ISignalRNotificationService _signalRService;

        public MaquinaService(
            IMaquinaRepository repository,
            ILogger<MaquinaService> logger,
            FlexoAPPDbContext context,
            FlexoAPP.API.Services.IActivityLoggerService activityLogger,
            FlexoAPP.API.Services.ISignalRNotificationService signalRService)
        {
            _repository = repository;
            _logger = logger;
            _context = context;
            _activityLogger = activityLogger;
            _signalRService = signalRService;
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


                using var checkIdCmd = conn.CreateCommand();
                checkIdCmd.CommandText = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'id'";
                var idExists = Convert.ToInt32(checkIdCmd.ExecuteScalar()) > 0;


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

                    using var cmd = conn.CreateCommand();


                    try {
                        cmd.CommandText = "ALTER TABLE maquinas DROP PRIMARY KEY";
                        cmd.ExecuteNonQuery();
                    } catch {}


                    if (idExists)
                    {
                        cmd.CommandText = "ALTER TABLE maquinas DROP COLUMN id";
                        cmd.ExecuteNonQuery();
                    }


                    cmd.CommandText = "ALTER TABLE maquinas MODIFY COLUMN ot_sap VARCHAR(50) NOT NULL";
                    cmd.ExecuteNonQuery();


                    cmd.CommandText = "ALTER TABLE maquinas ADD PRIMARY KEY (ot_sap)";
                    cmd.ExecuteNonQuery();
                    _logger.LogInformation("✅ Nueva PRIMARY KEY establecida en 'ot_sap'.");
                }


                using var fixStatusCmd = conn.CreateCommand();
                fixStatusCmd.CommandText = "ALTER TABLE maquinas MODIFY COLUMN estado VARCHAR(20) NULL DEFAULT NULL";
                fixStatusCmd.ExecuteNonQuery();
                _logger.LogInformation("✅ Columna 'estado' configurada para permitir NULL (Sin asignar).");
            }
            catch (Exception ex)
            {
                _logger.LogError($"❌ Error crítico migrando esquema de BD: {ex.Message}");
            }
            finally
            {
                _otSapIndexEnsured = true;
            }
        }

        public async Task<MaquinaDto> UpdateMachineStatusAsync(string otSap, string estado, string? observaciones, int? userId, string? userName, DateTime? clientTimestamp = null, List<string>? pantoneColors = null)
        {
            var now = clientTimestamp ?? DateTimeHelper.Now;
            var existing = await _repository.GetByOtSapAsync(otSap);
            if (existing == null)
            {
                throw new KeyNotFoundException($"Máquina con OT SAP {otSap} no encontrada");
            }

            var oldStatus = existing.Estado;
            var oldObservaciones = existing.Observaciones;

            var estadosValidos = new[] { "SIN_ASIGNAR", "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" };
            var estadoUpper = estado?.ToUpper() ?? "SIN_ASIGNAR";

            if (estadoUpper == "EN_PROCESO") estadoUpper = "CORRIENDO";
            if (!estadosValidos.Contains(estadoUpper))
            {
                throw new ArgumentException($"Estado inválido: {estado}");
            }


            if (estadoUpper == "PREPARANDO" && existing.Estado != "PREPARANDO")
            {
                existing.PreparandoStartedAt = now;
            }

            TimeSpan? duration = null;
            if (existing.Estado == "PREPARANDO" && (estadoUpper == "LISTO" || estadoUpper == "TERMINADO") && existing.PreparandoStartedAt.HasValue)
            {
                var elapsed = now - existing.PreparandoStartedAt.Value;
                // Solo guardar duración si pasaron más de 5 minutos (filtrar cambios accidentales)
                if (elapsed.TotalMinutes >= 5)
                {
                    duration = elapsed;
                }
            }

            if (estadoUpper != "PREPARANDO" && estadoUpper != "LISTO")
            {
                existing.PreparandoStartedAt = null;
            }

            // Actualizar estado
            existing.Estado = estadoUpper;
            
            // Actualizar observaciones si se proporcionan (independientemente del estado)
            if (observaciones != null)
            {
                existing.Observaciones = observaciones;
            }

            existing.UpdatedBy = userId;
            existing.UpdatedAt = now;

            // Solo actualizar lastActionBy/At si el estado realmente cambió
            bool estadoCambio = oldStatus != estadoUpper;
            if (estadoCambio)
            {
                existing.LastActionBy = userName ?? "Sistema";
                existing.LastActionAt = now;
            }

            var updated = await _repository.UpdateAsync(existing);

            // Capturar datos del activity log para no bloquear la respuesta HTTP
            var activityDetails = System.Text.Json.JsonSerializer.Serialize(new {
                otSap = otSap,
                articulo = existing.Articulo ?? "",
                descripcion = existing.Referencia ?? existing.Articulo ?? "",
                maquina = existing.NumeroMaquina,
                kilos = existing.Kilos,
                metros = existing.Metros ?? 0,
                pantoneColors = pantoneColors ?? new List<string>()
            });
            var activityOldValues = System.Text.Json.JsonSerializer.Serialize(new { estado = oldStatus, observaciones = oldObservaciones });
            var activityNewValues = System.Text.Json.JsonSerializer.Serialize(new { estado = estadoUpper, observaciones = existing.Observaciones });
            var activityEntityName = $"{otSap} - {existing.Articulo}";
            var activityDescription = $"{oldStatus} → {estadoUpper}";
            var activityDuration = duration;
            var activityUserId = userId;
            var activityUserName = userName ?? "Sistema";
            var activityTimestamp = now;

            // ===== BACKUP + ACTIVITY LOG EN BACKGROUND (fire-and-forget) =====
            var connectionString = _context.Database.GetConnectionString();

            var backupOtSap = existing.OtSap;
            var backupArticulo = existing.Articulo ?? "";
            var backupNumeroMaquina = existing.NumeroMaquina;
            var backupCliente = existing.Cliente ?? "";
            var backupReferencia = existing.Referencia;
            var backupTd = existing.Td;
            var backupTipoImpresion = existing.TipoImpresion;
            var backupNumeroColores = existing.NumeroColores;
            var backupColores = existing.Colores ?? "[]";
            var backupKilos = existing.Kilos;
            var backupMetros = existing.Metros;
            var backupFechaTinta = existing.FechaTintaEnMaquina;
            var backupSustrato = existing.Sustrato ?? "";
            var backupObservaciones = existing.Observaciones;
            var backupPreparandoStartedAt = existing.PreparandoStartedAt;
            var backupCreatedBy = existing.CreatedBy;
            var backupCreatedAt = existing.CreatedAt;

            _ = Task.Run(async () =>
            {
                try
                {
                    using var conn = new MySqlConnector.MySqlConnection(connectionString);
                    await conn.OpenAsync();

                    // Activity log (sin HttpContext; usa userId capturado)
                    try
                    {
                        using var actCmd = conn.CreateCommand();
                        actCmd.CommandText = @"
                            INSERT INTO Activities
                                (UserId, UserCode, Action, Description, Module, Details, Timestamp,
                                 EntityType, EntityName, Duration, OldValues, NewValues)
                            VALUES
                                (@UserId, @UserCode, @Action, @Description, @Module, @Details, @Timestamp,
                                 @EntityType, @EntityName, @Duration, @OldValues, @NewValues)";
                        actCmd.Parameters.AddWithValue("@UserId", activityUserId);
                        actCmd.Parameters.AddWithValue("@UserCode", activityUserName);
                        actCmd.Parameters.AddWithValue("@Action", "MACHINE_STATUS_CHANGED");
                        actCmd.Parameters.AddWithValue("@Description", activityDescription);
                        actCmd.Parameters.AddWithValue("@Module", "MACHINES");
                        actCmd.Parameters.AddWithValue("@Details", activityDetails);
                        actCmd.Parameters.AddWithValue("@Timestamp", activityTimestamp);
                        actCmd.Parameters.AddWithValue("@EntityType", "Maquina");
                        actCmd.Parameters.AddWithValue("@EntityName", activityEntityName);
                        actCmd.Parameters.AddWithValue("@Duration", activityDuration.HasValue ? (object)activityDuration.Value.Ticks : DBNull.Value);
                        actCmd.Parameters.AddWithValue("@OldValues", activityOldValues);
                        actCmd.Parameters.AddWithValue("@NewValues", activityNewValues);
                        await actCmd.ExecuteNonQueryAsync();
                    }
                    catch (Exception logEx)
                    {
                        _logger.LogError(logEx, "❌ ACTIVITY LOG FAILED for OT {OtSap}", backupOtSap);
                    }

                // Backup automático
                var estadosConAccion = new HashSet<string> { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO", "TERMINADO" };
                if (estadosConAccion.Contains(estadoUpper))
                {
                    try
                    {
                        using var backupConn = conn;

                        // Obtener colores reales del diseño
                        var coloresBackup = backupColores;
                        try
                        {
                            using var colorCmd = backupConn.CreateCommand();
                            colorCmd.CommandText = @"SELECT `color 1`, `color 2`, `color 3`, `color 4`, `color 5`,
                                   `color 6`, `color 7`, `color 8`, `color 9`, `color 10`
                            FROM designs WHERE ArticleF = @Articulo LIMIT 1";
                            colorCmd.Parameters.AddWithValue("@Articulo", backupArticulo);
                            using var colorReader = await colorCmd.ExecuteReaderAsync();
                            if (await colorReader.ReadAsync())
                            {
                                var designColors = new List<string>();
                                for (int ci = 0; ci < 10; ci++)
                                {
                                    if (!colorReader.IsDBNull(ci))
                                    {
                                        var c = colorReader.GetString(ci);
                                        if (!string.IsNullOrWhiteSpace(c)) designColors.Add(c);
                                    }
                                }
                                if (designColors.Count > 0)
                                    coloresBackup = System.Text.Json.JsonSerializer.Serialize(designColors);
                            }
                        }
                        catch { }

                        // DELETE + INSERT
                        using var deleteCmd = backupConn.CreateCommand();
                        deleteCmd.CommandText = "DELETE FROM maquinas_backup WHERE ot_sap = @OtSap";
                        deleteCmd.Parameters.AddWithValue("@OtSap", backupOtSap);
                        await deleteCmd.ExecuteNonQueryAsync();

                        using var insertCmd = backupConn.CreateCommand();
                        insertCmd.CommandText = @"
                            INSERT INTO maquinas_backup 
                                (ot_sap, Articulo, NumeroMaquina, Cliente, Referencia, Td, tipo_impresion,
                                 NumeroColores, Colores, Kilos, Metros, FechaTintaEnMaquina, Sustrato,
                                 Estado, Observaciones, LastActionBy, LastActionAt, preparando_started_at,
                                 CreatedBy, UpdatedBy, CreatedAt, UpdatedAt, backup_date, backup_reason,
                                 backup_user_id, backup_user_name)
                            VALUES
                                (@OtSap, @Articulo, @NumeroMaquina, @Cliente, @Referencia, @Td, @TipoImpresion,
                                 @NumeroColores, @Colores, @Kilos, @Metros, @FechaTinta, @Sustrato,
                                 @Estado, @Observaciones, @LastActionBy, @LastActionAt, @PreparandoStartedAt,
                                 @CreatedBy, @UpdatedBy, @CreatedAt, @UpdatedAt, @BackupDate, @BackupReason,
                                 @BackupUserId, @BackupUserName)";
                        insertCmd.Parameters.AddWithValue("@OtSap", backupOtSap);
                        insertCmd.Parameters.AddWithValue("@Articulo", backupArticulo);
                        insertCmd.Parameters.AddWithValue("@NumeroMaquina", backupNumeroMaquina);
                        insertCmd.Parameters.AddWithValue("@Cliente", backupCliente);
                        insertCmd.Parameters.AddWithValue("@Referencia", (object?)backupReferencia ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@Td", (object?)backupTd ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@TipoImpresion", (object?)backupTipoImpresion ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@NumeroColores", backupNumeroColores);
                        insertCmd.Parameters.AddWithValue("@Colores", coloresBackup);
                        insertCmd.Parameters.AddWithValue("@Kilos", backupKilos);
                        insertCmd.Parameters.AddWithValue("@Metros", (object?)backupMetros ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@FechaTinta", backupFechaTinta);
                        insertCmd.Parameters.AddWithValue("@Sustrato", backupSustrato);
                        insertCmd.Parameters.AddWithValue("@Estado", estadoUpper);
                        insertCmd.Parameters.AddWithValue("@Observaciones", (object?)backupObservaciones ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@LastActionBy", userName ?? "Sistema");
                        insertCmd.Parameters.AddWithValue("@LastActionAt", now);
                        insertCmd.Parameters.AddWithValue("@PreparandoStartedAt", (object?)backupPreparandoStartedAt ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@CreatedBy", (object?)backupCreatedBy ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@UpdatedBy", (object?)userId ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@CreatedAt", backupCreatedAt);
                        insertCmd.Parameters.AddWithValue("@UpdatedAt", now);
                        insertCmd.Parameters.AddWithValue("@BackupDate", now);
                        insertCmd.Parameters.AddWithValue("@BackupReason", $"STATUS_{estadoUpper}");
                        insertCmd.Parameters.AddWithValue("@BackupUserId", (object?)userId ?? DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@BackupUserName", userName ?? "Sistema");
                        await insertCmd.ExecuteNonQueryAsync();

                        // Limpieza cada 10 requests (no en cada uno)
                        if (Random.Shared.Next(10) == 0)
                        {
                            using var cleanupCmd = backupConn.CreateCommand();
                            cleanupCmd.CommandText = "DELETE FROM maquinas_backup WHERE backup_date < @LimitDate";
                            cleanupCmd.Parameters.AddWithValue("@LimitDate", now.AddMonths(-3));
                            await cleanupCmd.ExecuteNonQueryAsync();
                        }
                    }
                    catch (Exception backupEx)
                    {
                        _logger.LogError(backupEx, "❌ BACKUP FAILED for OT {OtSap}: {Error}", backupOtSap, backupEx.Message);
                    }
                }
                }
                catch (Exception bgEx)
                {
                    _logger.LogError(bgEx, "❌ Background status tasks failed for OT {OtSap}", backupOtSap);
                }
            });

            // SignalR sin bloquear la respuesta
            _ = _signalRService.NotifyMachineUpdatedAsync(new
            {
                type = "MachineUpdated",
                otSap = otSap,
                machineNumber = existing.NumeroMaquina,
                action = "STATUS_CHANGED",
                oldState = oldStatus,
                newState = estadoUpper,
                observaciones = existing.Observaciones,
                userName = userName ?? "Sistema",
                timestamp = DateTimeHelper.Now
            });

            return MapToDto(updated);
        }



        public async Task<object> FixDatabaseSchemaAsync()
        {
            var result = new Dictionary<string, object> { ["success"] = false };
            var logs = new List<string> { "Iniciando reparación de esquema..." };
            result["logs"] = logs;

            try
            {
                await CleanExistingOtSapDuplicatesAsync();
                logs.Add("Limpieza de duplicados finalizada.");

                var cs = _context.Database.GetConnectionString();
                using var conn = new MySqlConnector.MySqlConnection(cs);
                await conn.OpenAsync();

                using var cmd = conn.CreateCommand();


                try {
                    cmd.CommandText = "ALTER TABLE maquinas DROP PRIMARY KEY";
                    await cmd.ExecuteNonQueryAsync();
                    logs.Add("PK anterior eliminada.");
                } catch {}

                cmd.CommandText = "ALTER TABLE maquinas MODIFY COLUMN ot_sap VARCHAR(50) NOT NULL";
                await cmd.ExecuteNonQueryAsync();

                cmd.CommandText = "ALTER TABLE maquinas ADD PRIMARY KEY (ot_sap)";
                await cmd.ExecuteNonQueryAsync();
                logs.Add("PK establecida en ot_sap.");

                result["success"] = true;
                return result;
            }
            catch (Exception ex)
            {
                logs.Add($"Error: {ex.Message}");
                return result;
            }
        }

        public async Task<object> UpdateKilosDecimalPrecisionAsync()
        {
            var result = new Dictionary<string, object> { ["success"] = false };
            var logs = new List<string> { "Actualizando precisión de kilos..." };
            result["logs"] = logs;

            try
            {
                var cs = _context.Database.GetConnectionString();
                using var conn = new MySqlConnector.MySqlConnection(cs);
                await conn.OpenAsync();

                using var cmd = conn.CreateCommand();
                cmd.CommandText = "ALTER TABLE maquinas MODIFY COLUMN kilos DECIMAL(10,3) NOT NULL";
                await cmd.ExecuteNonQueryAsync();

                logs.Add("✅ Columna kilos actualizada a DECIMAL(10,3)");
                result["success"] = true;
                return result;
            }
            catch (Exception ex)
            {
                logs.Add($"❌ Error: {ex.Message}");
                return result;
            }
        }

        private async Task CleanExistingOtSapDuplicatesAsync()
        {
            try
            {
                var cs = _context.Database.GetConnectionString();
                using var conn = new MySqlConnector.MySqlConnection(cs);
                await conn.OpenAsync();

                using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
                    DELETE t1 FROM maquinas t1
                    INNER JOIN maquinas t2
                    WHERE t1.ot_sap = t2.ot_sap
                    AND t1.updated_at < t2.updated_at";

                var deleted = await cmd.ExecuteNonQueryAsync();
                _logger.LogInformation("🧹 Duplicados eliminados: {Count}", deleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error limpiando duplicados");
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
                TipoImpresion = maquina.TipoImpresion,
                NumeroColores = maquina.NumeroColores,
                Colores = maquina.GetColoresArray().ToList(),
                Kilos = maquina.Kilos,
                Metros = maquina.Metros,
                FechaTintaEnMaquina = maquina.FechaTintaEnMaquina,
                Sustrato = maquina.Sustrato,
                Estado = maquina.Estado ?? "LISTO",
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

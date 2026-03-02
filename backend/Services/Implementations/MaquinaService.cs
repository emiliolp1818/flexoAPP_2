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

        public async Task<MaquinaDto> UpdateMachineStatusAsync(string otSap, string estado, string? observaciones, int? userId, string? userName)
        {
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
                existing.PreparandoStartedAt = DateTime.Now;
            }

            TimeSpan? duration = null;
            if (existing.Estado == "PREPARANDO" && (estadoUpper == "LISTO" || estadoUpper == "TERMINADO") && existing.PreparandoStartedAt.HasValue)
            {
                duration = DateTime.Now - existing.PreparandoStartedAt.Value;
            }

            if (estadoUpper != "PREPARANDO" && estadoUpper != "LISTO")
            {
                existing.PreparandoStartedAt = null;
            }


            if (existing.Estado == "SUSPENDIDO" && estadoUpper != "SUSPENDIDO")
            {
                existing.Observaciones = null;
            }

            existing.Estado = estadoUpper;
            if (estadoUpper == "SUSPENDIDO" && observaciones != null)
            {
                existing.Observaciones = observaciones;
            }

            existing.UpdatedBy = userId;
            existing.UpdatedAt = DateTime.Now;
            existing.LastActionBy = userName ?? "Sistema";
            existing.LastActionAt = DateTime.Now;

            var updated = await _repository.UpdateAsync(existing);


            try
            {
                await _activityLogger.LogDetailedActivityAsync(
                    action: "MACHINE_STATUS_CHANGED",
                    description: $"Cambio de estado: {oldStatus} → {estadoUpper}",
                    module: "MACHINES",
                    entityType: "Maquina",
                    entityId: null,
                    entityName: $"{otSap} - {existing.Articulo}",
                    duration: duration,
                    oldValues: new { estado = oldStatus, observaciones = oldObservaciones },
                    newValues: new { estado = estadoUpper, observaciones = existing.Observaciones },
                    details: $"{{\"otSap\":\"{otSap}\",\"articulo\":\"{existing.Articulo}\",\"maquina\":{existing.NumeroMaquina}}}"
                );
            }
            catch {}

            // ===== EMITIR EVENTO DE SIGNALR PARA NOTIFICAR A TODOS LOS CLIENTES =====
            try
            {
                _logger.LogInformation($"📢 Emitiendo evento SignalR: MachineUpdated para OT {otSap}");
                await _signalRService.NotifyMachineUpdatedAsync(new
                {
                    type = "MachineUpdated",
                    otSap = otSap,
                    machineNumber = existing.NumeroMaquina,
                    action = "STATUS_CHANGED",
                    oldState = oldStatus,
                    newState = estadoUpper,
                    observaciones = existing.Observaciones,
                    userName = userName ?? "Sistema",
                    timestamp = DateTime.Now
                });
                _logger.LogInformation($"✅ Evento SignalR emitido exitosamente");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error emitiendo evento SignalR para OT {otSap}");
            }

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

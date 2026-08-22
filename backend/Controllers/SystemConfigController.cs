using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using flexoAPP.Models;
using System.Text.Json;

namespace flexoAPP.Controllers
{
    [ApiController]
    [Route("api/system")]
    public class SystemConfigController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<SystemConfigController> _logger;
        private readonly FlexoAPP.API.Services.IActivityLoggerService _activityLogger;

        public SystemConfigController(
            FlexoAPPDbContext context,
            ILogger<SystemConfigController> logger,
            FlexoAPP.API.Services.IActivityLoggerService activityLogger)
        {
            _context = context;
            _logger = logger;
            _activityLogger = activityLogger;
        }




        [HttpGet("configs")]
        public async Task<ActionResult<IEnumerable<object>>> GetConfigs()
        {
            try
            {
                var configs = await _context.SystemConfigs.ToListAsync();


                if (!configs.Any())
                {
                    await InitializeDefaultConfigs();
                    configs = await _context.SystemConfigs.ToListAsync();
                }

                // Asegurar que existan las configs de alertas de máquinas
                var added = await EnsureAlertConfigs(configs);
                if (added) configs = await _context.SystemConfigs.ToListAsync();


                var result = configs.Select(c => new
                {
                    id = c.Id,
                    name = c.Name,
                    description = c.Description,
                    value = ParseValue(c.Value, c.Type),
                    type = c.Type,
                    category = c.Category,
                    options = string.IsNullOrEmpty(c.Options) ? null : JsonSerializer.Deserialize<string[]>(c.Options)
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo configuraciones del sistema");
                return StatusCode(500, new { message = "Error al obtener configuraciones" });
            }
        }




        [HttpGet("configs/{id}")]
        public async Task<ActionResult<object>> GetConfig(string id)
        {
            try
            {
                var config = await _context.SystemConfigs.FindAsync(id);

                if (config == null)
                {
                    return NotFound(new { message = $"Configuración '{id}' no encontrada" });
                }

                var result = new
                {
                    id = config.Id,
                    name = config.Name,
                    description = config.Description,
                    value = ParseValue(config.Value, config.Type),
                    type = config.Type,
                    category = config.Category,
                    options = string.IsNullOrEmpty(config.Options) ? null : JsonSerializer.Deserialize<string[]>(config.Options)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo configuración {id}");
                return StatusCode(500, new { message = "Error al obtener configuración" });
            }
        }




        [HttpPut("configs/{id}")]
        public async Task<ActionResult> UpdateConfig(string id, [FromBody] UpdateConfigRequest request)
        {
            try
            {
                var config = await _context.SystemConfigs.FindAsync(id);

                if (config == null)
                {
                    // Crear la config si no existe (upsert)
                    config = new SystemConfig
                    {
                        Id = id,
                        Name = id,
                        Value = request.GetValueAsString(),
                        Type = "string",
                        Category = "General",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.SystemConfigs.Add(config);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Configuración creada correctamente" });
                }


                var oldValue = config.Value;


                config.Value = request.GetValueAsString();
                config.UpdatedAt = DateTime.UtcNow;

                _context.Entry(config).Property(x => x.Value).IsModified = true;
                _context.Entry(config).Property(x => x.UpdatedAt).IsModified = true;
                await _context.SaveChangesAsync();

                _logger.LogDebug($"Configuración '{id}' actualizada a: {config.Value}");


                try
                {
                    await _activityLogger.LogDetailedActivityAsync(
                        action: "CONFIG_UPDATED",
                        description: $"Cambio de configuración: {config.Name}",
                        module: "CONFIG",
                        entityType: "SystemConfig",
                        entityId: null,
                        entityName: config.Name,
                        oldValues: new { value = oldValue },
                        newValues: new { value = config.Value },
                        details: $"{{\"configId\":\"{id}\",\"category\":\"{config.Category}\"}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de cambio de configuración");
                }

                return Ok(new { message = "Configuración actualizada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando configuración {id}");
                return StatusCode(500, new { message = "Error al actualizar configuración" });
            }
        }




        private async Task InitializeDefaultConfigs()
        {
            var defaultConfigs = new List<SystemConfig>
            {

                new SystemConfig
                {
                    Id = "theme",
                    Name = "Tema",
                    Description = "Tema visual de la aplicación",
                    Value = "light",
                    Type = "select",
                    Category = "Apariencia",
                    Options = JsonSerializer.Serialize(new[] { "light", "dark", "auto" })
                },


                new SystemConfig
                {
                    Id = "language",
                    Name = "Idioma",
                    Description = "Idioma de la interfaz",
                    Value = "es",
                    Type = "select",
                    Category = "Regional",
                    Options = JsonSerializer.Serialize(new[] { "es", "en", "pt", "fr", "de" })
                },
                new SystemConfig
                {
                    Id = "timezone",
                    Name = "Zona Horaria",
                    Description = "Zona horaria del sistema",
                    Value = "America/Bogota",
                    Type = "select",
                    Category = "Regional",
                    Options = JsonSerializer.Serialize(new[] {
                        "America/Bogota", "America/Mexico_City", "America/Lima",
                        "America/Buenos_Aires", "America/Santiago", "America/Caracas",
                        "America/New_York", "Europe/Madrid"
                    })
                },
                new SystemConfig
                {
                    Id = "date_format",
                    Name = "Formato de Fecha",
                    Description = "Formato de visualización de fechas",
                    Value = "DD/MM/YYYY",
                    Type = "select",
                    Category = "Regional",
                    Options = JsonSerializer.Serialize(new[] { "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD" })
                },
                new SystemConfig
                {
                    Id = "time_format",
                    Name = "Formato de Hora",
                    Description = "Formato de visualización de hora",
                    Value = "24h",
                    Type = "select",
                    Category = "Regional",
                    Options = JsonSerializer.Serialize(new[] { "24h", "12h" })
                },


                new SystemConfig
                {
                    Id = "enable_notifications",
                    Name = "Habilitar Notificaciones",
                    Description = "Activar o desactivar las notificaciones del sistema",
                    Value = "true",
                    Type = "boolean",
                    Category = "Notificaciones"
                },
                new SystemConfig
                {
                    Id = "notification_sound",
                    Name = "Sonido de Notificaciones",
                    Description = "Reproducir sonido al recibir notificaciones",
                    Value = "true",
                    Type = "boolean",
                    Category = "Notificaciones"
                },
                new SystemConfig
                {
                    Id = "notification_duration",
                    Name = "Duración de Notificaciones",
                    Description = "Tiempo que permanecen visibles las notificaciones (segundos)",
                    Value = "5",
                    Type = "number",
                    Category = "Notificaciones"
                },


                new SystemConfig
                {
                    Id = "session_timeout",
                    Name = "Tiempo de Sesión",
                    Description = "Tiempo de inactividad antes de cerrar sesión (minutos)",
                    Value = "30",
                    Type = "number",
                    Category = "Seguridad"
                },

                // Alertas de color por pedidos listos
                new SystemConfig
                {
                    Id = "alert_red_max",
                    Name = "Alerta Roja (máximo)",
                    Description = "Pedidos listos hasta este número se muestran en ROJO",
                    Value = "3",
                    Type = "select",
                    Category = "Alertas Máquinas",
                    Options = JsonSerializer.Serialize(new[] { "0", "1", "2", "3", "4", "5" })
                },
                new SystemConfig
                {
                    Id = "alert_orange_max",
                    Name = "Alerta Naranja (máximo)",
                    Description = "Pedidos listos hasta este número se muestran en NARANJA",
                    Value = "5",
                    Type = "select",
                    Category = "Alertas Máquinas",
                    Options = JsonSerializer.Serialize(new[] { "1", "2", "3", "4", "5", "6", "7", "8" })
                },
                new SystemConfig
                {
                    Id = "alert_green_min",
                    Name = "Alerta Verde (mínimo)",
                    Description = "A partir de este número de pedidos listos se muestra en VERDE",
                    Value = "6",
                    Type = "select",
                    Category = "Alertas Máquinas",
                    Options = JsonSerializer.Serialize(new[] { "2", "3", "4", "5", "6", "7", "8", "9", "10" })
                }
            };

            _context.SystemConfigs.AddRange(defaultConfigs);
            await _context.SaveChangesAsync();

            _logger.LogDebug("Configuraciones predeterminadas inicializadas");
        }

        private async Task<bool> EnsureAlertConfigs(List<SystemConfig> configs)
        {
            var alertIds = new[] { "alert_red_max", "alert_orange_max", "alert_green_min" };
            var missing = alertIds.Where(id => !configs.Any(c => c.Id == id)).ToList();
            if (!missing.Any()) return false;

            var defaults = new Dictionary<string, (string name, string desc, string val, string opts)>
            {
                ["alert_red_max"] = ("Alerta Roja (máximo)", "Pedidos listos hasta este número se muestran en ROJO", "3", JsonSerializer.Serialize(new[] { "0","1","2","3","4","5" })),
                ["alert_orange_max"] = ("Alerta Naranja (máximo)", "Pedidos listos hasta este número se muestran en NARANJA", "5", JsonSerializer.Serialize(new[] { "1","2","3","4","5","6","7","8" })),
                ["alert_green_min"] = ("Alerta Verde (mínimo)", "A partir de este número de pedidos listos se muestra en VERDE", "6", JsonSerializer.Serialize(new[] { "2","3","4","5","6","7","8","9","10" }))
            };

            foreach (var id in missing)
            {
                var d = defaults[id];
                _context.SystemConfigs.Add(new SystemConfig { Id = id, Name = d.name, Description = d.desc, Value = d.val, Type = "select", Category = "Alertas Máquinas", Options = d.opts });
            }
            await _context.SaveChangesAsync();
            return true;
        }




        private object ParseValue(string value, string type)
        {
            return type switch
            {
                "boolean" => bool.Parse(value),
                "number" => int.Parse(value),
                _ => value
            };
        }
    }




    public class UpdateConfigRequest
    {
        public JsonElement? Value { get; set; }

        public string GetValueAsString()
        {
            if (!Value.HasValue) return string.Empty;
            var v = Value.Value;
            return v.ValueKind switch
            {
                JsonValueKind.String => v.GetString() ?? string.Empty,
                JsonValueKind.Number => v.GetRawText(),
                JsonValueKind.True => "true",
                JsonValueKind.False => "false",
                _ => v.ToString()
            };
        }
    }
}

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

        public SystemConfigController(FlexoAPPDbContext context, ILogger<SystemConfigController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todas las configuraciones del sistema
        /// </summary>
        [HttpGet("configs")]
        public async Task<ActionResult<IEnumerable<object>>> GetConfigs()
        {
            try
            {
                var configs = await _context.SystemConfigs.ToListAsync();

                // Si no hay configuraciones, crear las predeterminadas
                if (!configs.Any())
                {
                    await InitializeDefaultConfigs();
                    configs = await _context.SystemConfigs.ToListAsync();
                }

                // Convertir a formato esperado por el frontend
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

        /// <summary>
        /// Obtener una configuración específica
        /// </summary>
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

        /// <summary>
        /// Actualizar una configuración
        /// </summary>
        [HttpPut("configs/{id}")]
        public async Task<ActionResult> UpdateConfig(string id, [FromBody] UpdateConfigRequest request)
        {
            try
            {
                var config = await _context.SystemConfigs.FindAsync(id);

                if (config == null)
                {
                    return NotFound(new { message = $"Configuración '{id}' no encontrada" });
                }

                // Convertir el valor al formato string para almacenar
                config.Value = request.Value?.ToString() ?? string.Empty;
                config.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Configuración '{id}' actualizada a: {config.Value}");

                return Ok(new { message = "Configuración actualizada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando configuración {id}");
                return StatusCode(500, new { message = "Error al actualizar configuración" });
            }
        }

        /// <summary>
        /// Inicializar configuraciones predeterminadas
        /// </summary>
        private async Task InitializeDefaultConfigs()
        {
            var defaultConfigs = new List<SystemConfig>
            {
                // Apariencia
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

                // Regional
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

                // Notificaciones
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

                // Seguridad
                new SystemConfig
                {
                    Id = "session_timeout",
                    Name = "Tiempo de Sesión",
                    Description = "Tiempo de inactividad antes de cerrar sesión (minutos)",
                    Value = "30",
                    Type = "number",
                    Category = "Seguridad"
                }
            };

            _context.SystemConfigs.AddRange(defaultConfigs);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Configuraciones predeterminadas inicializadas");
        }

        /// <summary>
        /// Parsear valor según el tipo
        /// </summary>
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

    /// <summary>
    /// Request para actualizar configuración
    /// </summary>
    public class UpdateConfigRequest
    {
        public object? Value { get; set; }
    }
}

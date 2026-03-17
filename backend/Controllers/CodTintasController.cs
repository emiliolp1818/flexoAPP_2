using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.DTOs;
using System.Text.Json;
using System.Security.Claims;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/cod-tintas")]
    [Authorize]
    public class CodTintasController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<CodTintasController> _logger;

        public CodTintasController(FlexoAPPDbContext context, ILogger<CodTintasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los registros de códigos de tintas
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetAll()
        {
            try
            {
                var records = await _context.Set<CodTinta>()
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var response = records.Select(r => new CodTintaResponseDto
                {
                    Id = r.Id,
                    Articulo = r.Articulo,
                    Descripcion = r.Descripcion,
                    Colores = JsonSerializer.Deserialize<List<ColorTintaDto>>(r.ColoresData) ?? new(),
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    CreatedBy = r.CreatedBy,
                    UpdatedBy = r.UpdatedBy
                }).ToList();

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener códigos de tintas");
                return StatusCode(500, new { success = false, message = "Error al obtener códigos de tintas" });
            }
        }

        /// <summary>
        /// Obtener códigos de tintas con paginación
        /// </summary>
        [HttpGet("paginated")]
        public async Task<ActionResult<object>> GetPaginated(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? search = null)
        {
            try
            {
                _logger.LogInformation("📄 Obteniendo códigos de tintas paginados - Página: {Page}, Tamaño: {PageSize}, Búsqueda: {Search}", 
                    page, pageSize, search ?? "ninguna");

                var query = _context.Set<CodTinta>().AsQueryable();

                // Aplicar búsqueda si existe
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var searchTerm = search.Trim().ToUpper();
                    query = query.Where(c => 
                        c.Articulo.ToUpper().Contains(searchTerm) || 
                        c.Descripcion.ToUpper().Contains(searchTerm));
                }

                // Obtener total de registros
                var totalCount = await query.CountAsync();

                // Calcular total de páginas
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                // Obtener registros paginados
                var records = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var items = records.Select(r => new CodTintaResponseDto
                {
                    Id = r.Id,
                    Articulo = r.Articulo,
                    Descripcion = r.Descripcion,
                    Colores = JsonSerializer.Deserialize<List<ColorTintaDto>>(r.ColoresData) ?? new(),
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    CreatedBy = r.CreatedBy,
                    UpdatedBy = r.UpdatedBy
                }).ToList();

                var response = new
                {
                    items = items,
                    page = page,
                    pageSize = pageSize,
                    totalCount = totalCount,
                    totalPages = totalPages,
                    hasNextPage = page < totalPages,
                    hasPreviousPage = page > 1
                };

                _logger.LogInformation("✅ Códigos de tintas paginados obtenidos: {Count} de {Total}", items.Count, totalCount);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener códigos de tintas paginados");
                return StatusCode(500, new { success = false, message = "Error al obtener códigos de tintas paginados" });
            }
        }

        /// <summary>
        /// Obtener un registro por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            try
            {
                var record = await _context.Set<CodTinta>().FindAsync(id);

                if (record == null)
                {
                    return NotFound(new { success = false, message = "Registro no encontrado" });
                }

                var response = new CodTintaResponseDto
                {
                    Id = record.Id,
                    Articulo = record.Articulo,
                    Descripcion = record.Descripcion,
                    Colores = JsonSerializer.Deserialize<List<ColorTintaDto>>(record.ColoresData) ?? new(),
                    CreatedAt = record.CreatedAt,
                    UpdatedAt = record.UpdatedAt,
                    CreatedBy = record.CreatedBy,
                    UpdatedBy = record.UpdatedBy
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener código de tintas {Id}", id);
                return StatusCode(500, new { success = false, message = "Error al obtener código de tintas" });
            }
        }

        /// <summary>
        /// Crear un nuevo registro de código de tintas
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] CreateCodTintaDto dto)
        {
            try
            {
                // Validar que el artículo no exista
                var exists = await _context.Set<CodTinta>()
                    .AnyAsync(c => c.Articulo == dto.Articulo);

                if (exists)
                {
                    return BadRequest(new { success = false, message = "Ya existe un registro para este artículo" });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";

                var record = new CodTinta
                {
                    Articulo = dto.Articulo,
                    Descripcion = dto.Descripcion,
                    ColoresData = JsonSerializer.Serialize(dto.Colores),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = username,
                    UpdatedBy = username
                };

                _context.Set<CodTinta>().Add(record);
                await _context.SaveChangesAsync();

                var response = new CodTintaResponseDto
                {
                    Id = record.Id,
                    Articulo = record.Articulo,
                    Descripcion = record.Descripcion,
                    Colores = dto.Colores,
                    CreatedAt = record.CreatedAt,
                    UpdatedAt = record.UpdatedAt,
                    CreatedBy = record.CreatedBy,
                    UpdatedBy = record.UpdatedBy
                };

                _logger.LogInformation("Código de tintas creado: {Articulo} por {User}", dto.Articulo, username);

                return CreatedAtAction(nameof(GetById), new { id = record.Id }, new { success = true, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear código de tintas");
                return StatusCode(500, new { success = false, message = "Error al crear código de tintas" });
            }
        }

        /// <summary>
        /// Actualizar un registro de código de tintas
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<object>> Update(int id, [FromBody] UpdateCodTintaDto dto)
        {
            try
            {
                _logger.LogInformation("📝 Actualizando código de tintas {Id}. Descripción: {Desc}, Colores: {Colors}", 
                    id, dto.Descripcion, JsonSerializer.Serialize(dto.Colores));

                var record = await _context.Set<CodTinta>().FindAsync(id);

                if (record == null)
                {
                    return NotFound(new { success = false, message = "Registro no encontrado" });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";

                _logger.LogInformation("📋 Valores ANTES - Descripción: {OldDesc}, ColoresData: {OldColors}", 
                    record.Descripcion, record.ColoresData);

                record.Descripcion = dto.Descripcion;
                record.ColoresData = JsonSerializer.Serialize(dto.Colores);
                record.UpdatedAt = DateTime.UtcNow;
                record.UpdatedBy = username;

                // Marcar explícitamente las propiedades como modificadas
                _context.Entry(record).Property(x => x.Descripcion).IsModified = true;
                _context.Entry(record).Property(x => x.ColoresData).IsModified = true;
                _context.Entry(record).Property(x => x.UpdatedAt).IsModified = true;
                _context.Entry(record).Property(x => x.UpdatedBy).IsModified = true;

                _logger.LogInformation("📋 Valores DESPUÉS - Descripción: {NewDesc}, ColoresData: {NewColors}", 
                    record.Descripcion, record.ColoresData);

                var rowsAffected = await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Cambios guardados en la base de datos para ID {Id}. Filas afectadas: {Rows}", id, rowsAffected);

                var response = new CodTintaResponseDto
                {
                    Id = record.Id,
                    Articulo = record.Articulo,
                    Descripcion = record.Descripcion,
                    Colores = dto.Colores,
                    CreatedAt = record.CreatedAt,
                    UpdatedAt = record.UpdatedAt,
                    CreatedBy = record.CreatedBy,
                    UpdatedBy = record.UpdatedBy
                };

                _logger.LogInformation("Código de tintas actualizado: {Id} por {User}", id, username);

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar código de tintas {Id}", id);
                return StatusCode(500, new { success = false, message = "Error al actualizar código de tintas" });
            }
        }

        /// <summary>
        /// Eliminar un registro de código de tintas
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<object>> Delete(int id)
        {
            try
            {
                var record = await _context.Set<CodTinta>().FindAsync(id);

                if (record == null)
                {
                    return NotFound(new { success = false, message = "Registro no encontrado" });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";

                _context.Set<CodTinta>().Remove(record);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Código de tintas eliminado: {Id} por {User}", id, username);

                return Ok(new { success = true, message = "Registro eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar código de tintas {Id}", id);
                return StatusCode(500, new { success = false, message = "Error al eliminar código de tintas" });
            }
        }

        /// <summary>
        /// Buscar por artículo
        /// </summary>
        [HttpGet("search/{articulo}")]
        public async Task<ActionResult<object>> SearchByArticulo(string articulo)
        {
            try
            {
                var records = await _context.Set<CodTinta>()
                    .Where(c => c.Articulo.Contains(articulo))
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var response = records.Select(r => new CodTintaResponseDto
                {
                    Id = r.Id,
                    Articulo = r.Articulo,
                    Descripcion = r.Descripcion,
                    Colores = JsonSerializer.Deserialize<List<ColorTintaDto>>(r.ColoresData) ?? new(),
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    CreatedBy = r.CreatedBy,
                    UpdatedBy = r.UpdatedBy
                }).ToList();

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar códigos de tintas por artículo {Articulo}", articulo);
                return StatusCode(500, new { success = false, message = "Error al buscar códigos de tintas" });
            }
        }

        /// <summary>
        /// Importar códigos de tintas desde Excel
        /// </summary>
        [HttpPost("import/excel")]
        public async Task<ActionResult<object>> ImportFromExcel([FromBody] List<Dictionary<string, object>> excelData)
        {
            try
            {
                _logger.LogInformation("📥 Iniciando importación de códigos de tintas desde Excel");
                _logger.LogInformation($"📊 Filas recibidas: {excelData?.Count ?? 0}");

                if (excelData == null || excelData.Count == 0)
                {
                    _logger.LogWarning("⚠️ No se recibieron datos para importar");
                    return BadRequest(new { success = false, message = "No se recibieron datos para importar" });
                }

                // Log de muestra de datos recibidos
                if (excelData.Count > 0)
                {
                    _logger.LogInformation($"🔍 Primera fila recibida: {JsonSerializer.Serialize(excelData[0])}");
                }

                var importedCount = 0;
                var updatedCount = 0;
                var errorCount = 0;
                var errors = new List<string>();

                // Agrupar por artículo para procesar registros completos
                var groupedByArticulo = excelData
                    .Where(row => row.ContainsKey("A") && row["A"] != null && !string.IsNullOrWhiteSpace(row["A"].ToString()))
                    .GroupBy(row => row["A"].ToString()!.Trim())
                    .ToList();

                _logger.LogInformation($"📦 Artículos únicos encontrados: {groupedByArticulo.Count}");

                foreach (var articuloGroup in groupedByArticulo)
                {
                    try
                    {
                        var articulo = articuloGroup.Key;
                        var rows = articuloGroup.ToList();

                        // Obtener descripción del primer registro
                        var descripcion = rows.First().ContainsKey("B") && rows.First()["B"] != null
                            ? rows.First()["B"].ToString()!.Trim()
                            : "";

                        // Procesar colores de todas las filas del artículo
                        var colores = new List<ColorTintaDto>();

                        foreach (var row in rows)
                        {
                            var colorNombre = row.ContainsKey("F") && row["F"] != null
                                ? row["F"].ToString()!.Trim()
                                : "";

                            if (string.IsNullOrWhiteSpace(colorNombre))
                                continue;

                            var codTinta = row.ContainsKey("D") && row["D"] != null
                                ? row["D"].ToString()!.Trim()
                                : "";

                            var coberturaStr = row.ContainsKey("G") && row["G"] != null
                                ? row["G"].ToString()!.Trim()
                                : "";

                            decimal? cobertura = null;
                            if (!string.IsNullOrWhiteSpace(coberturaStr))
                            {
                                _logger.LogDebug($"🔍 Procesando cobertura: '{coberturaStr}' para color {colorNombre}");
                                
                                // Intentar parsear con cultura invariante (punto como decimal)
                                if (decimal.TryParse(coberturaStr, System.Globalization.NumberStyles.Any, 
                                    System.Globalization.CultureInfo.InvariantCulture, out var coberturaValue))
                                {
                                    cobertura = coberturaValue;
                                    _logger.LogDebug($"✅ Cobertura parseada (InvariantCulture): {cobertura}");
                                }
                                // Si falla, intentar con cultura actual (coma como decimal)
                                else if (decimal.TryParse(coberturaStr, System.Globalization.NumberStyles.Any, 
                                    System.Globalization.CultureInfo.CurrentCulture, out coberturaValue))
                                {
                                    cobertura = coberturaValue;
                                    _logger.LogDebug($"✅ Cobertura parseada (CurrentCulture): {cobertura}");
                                }
                                // Si aún falla, intentar reemplazando coma por punto
                                else if (decimal.TryParse(coberturaStr.Replace(',', '.'), System.Globalization.NumberStyles.Any, 
                                    System.Globalization.CultureInfo.InvariantCulture, out coberturaValue))
                                {
                                    cobertura = coberturaValue;
                                    _logger.LogDebug($"✅ Cobertura parseada (Replace): {cobertura}");
                                }
                                else
                                {
                                    _logger.LogWarning($"⚠️ No se pudo parsear cobertura: '{coberturaStr}'");
                                }
                            }

                            var codAnilox = row.ContainsKey("H") && row["H"] != null
                                ? row["H"].ToString()!.Trim()
                                : "";

                            colores.Add(new ColorTintaDto
                            {
                                Nombre = colorNombre,
                                CodTinta = codTinta,
                                Cobertura = cobertura,
                                CodAnilox = codAnilox
                            });
                        }

                        if (colores.Count == 0)
                        {
                            errors.Add($"Artículo {articulo}: No se encontraron colores válidos");
                            errorCount++;
                            continue;
                        }

                        // Verificar si el artículo ya existe
                        var existingRecord = await _context.Set<CodTinta>()
                            .FirstOrDefaultAsync(c => c.Articulo == articulo);

                        if (existingRecord != null)
                        {
                            // Actualizar registro existente
                            existingRecord.Descripcion = descripcion;
                            existingRecord.ColoresData = JsonSerializer.Serialize(colores);
                            existingRecord.UpdatedAt = DateTime.UtcNow;
                            existingRecord.UpdatedBy = User.Identity?.Name ?? "System";

                            updatedCount++;
                            _logger.LogInformation($"✏️ Actualizado: {articulo} con {colores.Count} colores");
                        }
                        else
                        {
                            // Crear nuevo registro
                            var newRecord = new CodTinta
                            {
                                Articulo = articulo,
                                Descripcion = descripcion,
                                ColoresData = JsonSerializer.Serialize(colores),
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow,
                                CreatedBy = User.Identity?.Name ?? "System",
                                UpdatedBy = User.Identity?.Name ?? "System"
                            };

                            _context.Set<CodTinta>().Add(newRecord);
                            importedCount++;
                            _logger.LogInformation($"➕ Creado: {articulo} con {colores.Count} colores");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error procesando artículo {articuloGroup.Key}");
                        errors.Add($"Artículo {articuloGroup.Key}: {ex.Message}");
                        errorCount++;
                    }
                }

                await _context.SaveChangesAsync();

                var result = new
                {
                    success = true,
                    message = $"Importación completada: {importedCount} creados, {updatedCount} actualizados, {errorCount} errores",
                    imported = importedCount,
                    updated = updatedCount,
                    errors = errorCount,
                    errorDetails = errors
                };

                _logger.LogInformation($"✅ Importación completada: {importedCount} creados, {updatedCount} actualizados, {errorCount} errores");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al importar códigos de tintas desde Excel");
                return StatusCode(500, new { success = false, message = "Error al importar códigos de tintas", error = ex.Message });
            }
        }
    }
}

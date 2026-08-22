using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoAPP.API.Data.Context;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/pantone-colors")]
    public class PantoneColorsController : ControllerBase
    {
        private readonly FlexoAPPDbContext _context;

        public PantoneColorsController(FlexoAPPDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtener todos los colores Pantone
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var colors = await _context.PantoneColors
                .OrderBy(c => c.ColorType)
                .ThenBy(c => c.Code)
                .AsNoTracking()
                .ToListAsync();

            var result = colors.Select(c => new
            {
                c.Id,
                code = c.Code,
                name = c.Name,
                displayName = c.DisplayName,
                hex = c.Hex,
                rgb = new { r = c.RgbR, g = c.RgbG, b = c.RgbB },
                cmyk = new { c = c.CmykC, m = c.CmykM, y = c.CmykY, k = c.CmykK },
                lab = c.LabL.HasValue ? new { l = c.LabL, a = c.LabA, b = c.LabB } : null,
                category = c.Category,
                colorType = c.ColorType,
                isCustom = c.IsCustom
            });

            return Ok(result);
        }

        /// <summary>
        /// Buscar colores por código o nombre
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
                return Ok(Array.Empty<object>());

            var searchTerm = term.Trim().ToLower();

            var colors = await _context.PantoneColors
                .Where(c => c.Code.ToLower().Contains(searchTerm) ||
                            c.Name.ToLower().Contains(searchTerm) ||
                            c.DisplayName.ToLower().Contains(searchTerm))
                .OrderBy(c => c.Code)
                .Take(50)
                .AsNoTracking()
                .ToListAsync();

            var result = colors.Select(c => new
            {
                c.Id,
                code = c.Code,
                name = c.Name,
                displayName = c.DisplayName,
                hex = c.Hex,
                rgb = new { r = c.RgbR, g = c.RgbG, b = c.RgbB },
                cmyk = new { c = c.CmykC, m = c.CmykM, y = c.CmykY, k = c.CmykK },
                lab = c.LabL.HasValue ? new { l = c.LabL, a = c.LabA, b = c.LabB } : null,
                category = c.Category,
                colorType = c.ColorType,
                isCustom = c.IsCustom
            });

            return Ok(result);
        }

        /// <summary>
        /// Crear un nuevo color Pantone (por paleta HEX o por L*a*b*)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePantoneColorDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Hex))
                return BadRequest(new { message = "Código y color HEX son requeridos" });

            // Verificar si ya existe
            var exists = await _context.PantoneColors
                .AnyAsync(c => c.Code.ToLower() == dto.Code.Trim().ToLower());

            if (exists)
                return Conflict(new { message = $"El color con código '{dto.Code}' ya existe" });

            var color = new PantoneColor
            {
                Code = dto.Code.Trim(),
                Name = dto.Name?.Trim() ?? $"Pantone {dto.Code.Trim()}",
                DisplayName = dto.DisplayName?.Trim() ?? $"P {dto.Code.Trim()}",
                Hex = dto.Hex.Trim(),
                RgbR = dto.RgbR,
                RgbG = dto.RgbG,
                RgbB = dto.RgbB,
                CmykC = dto.CmykC,
                CmykM = dto.CmykM,
                CmykY = dto.CmykY,
                CmykK = dto.CmykK,
                LabL = dto.LabL,
                LabA = dto.LabA,
                LabB = dto.LabB,
                Category = dto.Category?.Trim() ?? "Manual",
                ColorType = dto.ColorType?.Trim() ?? "pantone",
                IsCustom = true
            };

            _context.PantoneColors.Add(color);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                color.Id,
                code = color.Code,
                name = color.Name,
                displayName = color.DisplayName,
                hex = color.Hex,
                rgb = new { r = color.RgbR, g = color.RgbG, b = color.RgbB },
                cmyk = new { c = color.CmykC, m = color.CmykM, y = color.CmykY, k = color.CmykK },
                lab = color.LabL.HasValue ? new { l = color.LabL, a = color.LabA, b = color.LabB } : null,
                category = color.Category,
                colorType = color.ColorType,
                isCustom = color.IsCustom
            });
        }

        /// <summary>
        /// Actualizar un color Pantone existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePantoneColorDto dto)
        {
            var color = await _context.PantoneColors.FindAsync(id);
            if (color == null)
                return NotFound(new { message = "Color no encontrado" });

            if (!string.IsNullOrWhiteSpace(dto.Code)) color.Code = dto.Code.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Name)) color.Name = dto.Name.Trim();
            if (!string.IsNullOrWhiteSpace(dto.DisplayName)) color.DisplayName = dto.DisplayName.Trim();
            if (!string.IsNullOrWhiteSpace(dto.Hex)) color.Hex = dto.Hex.Trim();
            color.RgbR = dto.RgbR;
            color.RgbG = dto.RgbG;
            color.RgbB = dto.RgbB;
            color.CmykC = dto.CmykC;
            color.CmykM = dto.CmykM;
            color.CmykY = dto.CmykY;
            color.CmykK = dto.CmykK;
            color.LabL = dto.LabL;
            color.LabA = dto.LabA;
            color.LabB = dto.LabB;
            if (!string.IsNullOrWhiteSpace(dto.Category)) color.Category = dto.Category.Trim();
            if (!string.IsNullOrWhiteSpace(dto.ColorType)) color.ColorType = dto.ColorType.Trim();
            color.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                color.Id,
                code = color.Code,
                name = color.Name,
                displayName = color.DisplayName,
                hex = color.Hex,
                rgb = new { r = color.RgbR, g = color.RgbG, b = color.RgbB },
                cmyk = new { c = color.CmykC, m = color.CmykM, y = color.CmykY, k = color.CmykK },
                lab = color.LabL.HasValue ? new { l = color.LabL, a = color.LabA, b = color.LabB } : null,
                category = color.Category,
                colorType = color.ColorType,
                isCustom = color.IsCustom
            });
        }

        /// <summary>
        /// Eliminar un color personalizado
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var color = await _context.PantoneColors.FindAsync(id);
            if (color == null)
                return NotFound(new { message = "Color no encontrado" });

            _context.PantoneColors.Remove(color);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Color eliminado correctamente" });
        }
    }

    public class CreatePantoneColorDto
    {
        public string Code { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? DisplayName { get; set; }
        public string Hex { get; set; } = "#000000";
        public int RgbR { get; set; }
        public int RgbG { get; set; }
        public int RgbB { get; set; }
        public int CmykC { get; set; }
        public int CmykM { get; set; }
        public int CmykY { get; set; }
        public int CmykK { get; set; }
        public double? LabL { get; set; }
        public double? LabA { get; set; }
        public double? LabB { get; set; }
        public string? Category { get; set; }
        public string? ColorType { get; set; }
    }
}

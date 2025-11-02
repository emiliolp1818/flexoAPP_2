using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Temporal para pruebas
    public class DesignsController : ControllerBase
    {
        private readonly IDesignService _designService;
        private readonly ILogger<DesignsController> _logger;

        public DesignsController(IDesignService designService, ILogger<DesignsController> logger)
        {
            _designService = designService;
            _logger = logger;
        }

        /// <summary>
        /// Test endpoint
        /// </summary>
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Designs controller is working", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Test database connection
        /// </summary>
        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var designs = await _designService.GetAllDesignsAsync();
                return Ok(new { 
                    message = "Database connection working", 
                    designCount = designs.Count(),
                    timestamp = DateTime.UtcNow 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database test failed");
                return StatusCode(500, new { 
                    message = "Database connection failed", 
                    error = ex.Message,
                    timestamp = DateTime.UtcNow 
                });
            }
        }

        /// <summary>
        /// Get all designs
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetAllDesigns()
        {
            try
            {
                _logger.LogInformation("Getting all designs...");
                var designs = await _designService.GetAllDesignsAsync();
                _logger.LogInformation($"Successfully retrieved {designs.Count()} designs");
                return Ok(designs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all designs");
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get design by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<DesignDto>> GetDesign(int id)
        {
            try
            {
                var design = await _designService.GetDesignByIdAsync(id);
                if (design == null)
                {
                    return NotFound($"Design with ID {id} not found");
                }
                return Ok(design);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting design with ID: {DesignId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new design
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<DesignDto>> CreateDesign([FromBody] CreateDesignDto createDto)
        {
            try
            {
                _logger.LogInformation("🎨 Creating new design: {@CreateDto}", createDto);
                
                var userId = 1; // Temporary: use default user ID
                var design = await _designService.CreateDesignAsync(createDto, userId);
                return CreatedAtAction(nameof(GetDesign), new { id = design.Id }, design);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Invalid operation creating design");
                return Conflict(ex.Message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Invalid argument creating design");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating design: {Message}", ex.Message);
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing design
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<DesignDto>> UpdateDesign(int id, [FromBody] UpdateDesignDto updateDto)
        {
            try
            {
                var userId = 1; // Temporary: use default user ID
                var design = await _designService.UpdateDesignAsync(id, updateDto, userId);
                return Ok(design);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating design with ID: {DesignId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a design
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDesign(int id)
        {
            try
            {
                var result = await _designService.DeleteDesignAsync(id);
                if (!result)
                {
                    return NotFound($"Design with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting design with ID: {DesignId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Duplicate an existing design
        /// </summary>
        [HttpPost("{id}/duplicate")]
        public async Task<ActionResult<DesignDto>> DuplicateDesign(int id)
        {
            try
            {
                var userId = 1; // Temporary: use default user ID
                var design = await _designService.DuplicateDesignAsync(id, userId);
                return CreatedAtAction(nameof(GetDesign), new { id = design.Id }, design);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error duplicating design with ID: {DesignId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update design status
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateDesignStatus(int id, [FromBody] DesignStatusUpdateDto statusDto)
        {
            try
            {
                var userId = 1; // Temporary: use default user ID
                var result = await _designService.UpdateDesignStatusAsync(id, statusDto.Status, userId);
                if (!result)
                {
                    return NotFound($"Design with ID {id} not found");
                }
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating design status for ID: {DesignId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get design statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<DesignStatsDto>> GetDesignStats()
        {
            try
            {
                var stats = await _designService.GetDesignStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting design statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get recent designs
        /// </summary>
        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetRecentDesigns([FromQuery] int count = 10)
        {
            try
            {
                var designs = await _designService.GetRecentDesignsAsync(count);
                return Ok(designs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent designs");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export designs to Excel
        /// </summary>
        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportToExcel()
        {
            try
            {
                var excelData = await _designService.ExportToExcelAsync();
                
                var fileName = $"Diseños_FlexoAPP_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.xlsx";
                
                return File(excelData, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting designs to Excel");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Test import endpoint
        /// </summary>
        [HttpGet("import/test")]
        public IActionResult TestImportEndpoint()
        {
            return Ok(new { 
                message = "Import endpoint is working", 
                timestamp = DateTime.UtcNow,
                maxFileSize = "200MB",
                supportedFormats = new[] { ".xlsx", ".xls" }
            });
        }

        /// <summary>
        /// Import designs from Excel file (MASSIVE DATA UPLOAD)
        /// </summary>
        [HttpPost("import/excel")]
        [RequestSizeLimit(200_000_000)] // 200MB limit
        public async Task<IActionResult> ImportFromExcel(IFormFile file)
        {
            try
            {
                _logger.LogInformation("🚀 Starting massive Excel import process...");
                
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { error = "No file uploaded" });
                }

                if (!file.FileName.EndsWith(".xlsx") && !file.FileName.EndsWith(".xls"))
                {
                    return BadRequest(new { error = "Only Excel files (.xlsx, .xls) are allowed" });
                }

                _logger.LogInformation($"📁 Processing file: {file.FileName} ({file.Length / 1024 / 1024:F2} MB)");

                var result = await _designService.ImportFromExcelAsync(file);
                
                _logger.LogInformation($"✅ Import completed: {result.SuccessCount} successful, {result.ErrorCount} errors");

                return Ok(new { 
                    message = "Excel import completed successfully",
                    successCount = result.SuccessCount,
                    errorCount = result.ErrorCount,
                    errors = result.Errors.Take(10), // Only return first 10 errors
                    totalProcessed = result.SuccessCount + result.ErrorCount,
                    fileName = file.FileName,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error importing Excel file: {Message}", ex.Message);
                return StatusCode(500, new { 
                    error = "Error processing Excel file", 
                    message = ex.Message,
                    timestamp = DateTime.UtcNow 
                });
            }
        }

        /// <summary>
        /// Clear all existing designs
        /// </summary>
        [HttpPost("clear-all")]
        public async Task<IActionResult> ClearAllDesigns()
        {
            try
            {
                _logger.LogInformation("🗑️ Clearing all existing designs...");
                
                var deletedCount = await _designService.ClearAllDesignsAsync();
                
                _logger.LogInformation($"✅ Cleared {deletedCount} designs from database");

                return Ok(new { 
                    message = "All designs cleared successfully",
                    deletedCount = deletedCount,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error clearing designs: {Message}", ex.Message);
                return StatusCode(500, new { 
                    error = "Error clearing designs", 
                    message = ex.Message,
                    timestamp = DateTime.UtcNow 
                });
            }
        }
    }
}
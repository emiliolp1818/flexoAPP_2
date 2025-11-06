using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Services;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        /// Ultra simple test endpoint without dependencies
        /// </summary>
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            try
            {
                return Ok("PING_OK");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"PING_ERROR: {ex.Message}");
            }
        }

        /// <summary>
        /// Even simpler test endpoint
        /// </summary>
        [HttpGet("hello")]
        public string Hello()
        {
            return "Hello from DesignsController";
        }

        /// <summary>
        /// Test endpoint without any dependencies
        /// </summary>
        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new { 
                controller = "DesignsController",
                status = "WORKING",
                timestamp = DateTime.UtcNow,
                message = "Controller is responding without dependencies"
            });
        }

        /// <summary>
        /// Test dependency injection
        /// </summary>
        [HttpGet("check-dependencies")]
        public IActionResult CheckDependencies()
        {
            try
            {
                var result = new
                {
                    controller = "DesignsController",
                    designService = _designService != null ? "INJECTED" : "NULL",
                    logger = _logger != null ? "INJECTED" : "NULL",
                    timestamp = DateTime.UtcNow,
                    status = "DEPENDENCY_CHECK_COMPLETE"
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    error = "DEPENDENCY_CHECK_FAILED",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Simple test endpoint for /all route
        /// </summary>
        [HttpGet("all-test")]
        public IActionResult TestAllRoute()
        {
            try
            {
                return Ok(new { 
                    message = "All route is working", 
                    timestamp = DateTime.UtcNow,
                    route = "/api/designs/all-test",
                    status = "SUCCESS"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    error = "Test route failed",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow,
                    status = "ERROR"
                });
            }
        }

        /// <summary>
        /// Test endpoint to get raw designs from database without DTO mapping
        /// </summary>
        [HttpGet("all-raw")]
        public async Task<IActionResult> GetAllDesignsRaw()
        {
            try
            {
                _logger.LogInformation("🧪 Testing raw designs from database...");
                
                // Obtener diseños directamente del repositorio sin mapeo
                var designs = await _designService.GetAllDesignsRawAsync();
                var designsList = designs.ToList();
                
                _logger.LogInformation($"✅ Retrieved {designsList.Count} raw designs");
                
                return Ok(new { 
                    count = designsList.Count,
                    designs = designsList.Take(3).Select(d => new {
                        d.Id,
                        d.ArticleF,
                        d.Client,
                        d.Description,
                        d.Substrate,
                        d.Type,
                        d.PrintType,
                        d.ColorCount,
                        d.Status
                    }), // Solo los primeros 3 para prueba
                    message = $"Raw designs retrieved successfully - Total: {designsList.Count}",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting raw designs: {Message}", ex.Message);
                return BadRequest(new { 
                    error = "Error retrieving raw designs",
                    message = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get count of designs in database
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetDesignsCount()
        {
            try
            {
                var count = await _designService.GetDesignsCountAsync();
                
                return Ok(new { 
                    count = count,
                    message = $"Total designs in database: {count}",
                    isEmpty = count == 0,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    error = "Error getting designs count",
                    message = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Simple database test without complex services
        /// </summary>
        [HttpGet("db-test")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                // Intentar una operación simple en la base de datos
                var count = await _designService.GetDesignsCountAsync();
                
                return Ok(new { 
                    status = "DB_CONNECTED",
                    message = "Database connection successful",
                    designCount = count,
                    isEmpty = count == 0,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return Ok(new { 
                    status = "DB_ERROR",
                    message = "Database connection failed",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Create sample data for testing (only if database is empty)
        /// </summary>
        [HttpPost("create-sample-data")]
        public async Task<IActionResult> CreateSampleData()
        {
            try
            {
                _logger.LogInformation("🧪 Starting sample data creation...");
                
                // Verificar si la BD está vacía
                var count = await _designService.GetDesignsCountAsync();
                _logger.LogInformation($"📊 Current design count: {count}");
                
                if (count > 0)
                {
                    _logger.LogWarning("⚠️ Database is not empty, skipping sample data creation");
                    return BadRequest(new { 
                        error = "Database is not empty",
                        message = $"Database already contains {count} designs. Clear database first or import Excel data.",
                        currentCount = count,
                        timestamp = DateTime.UtcNow
                    });
                }

                _logger.LogInformation("✅ Database is empty, creating sample data...");

                // Crear un diseño de prueba usando el método de importación
                var sampleDesigns = new List<Models.Entities.Design>
                {
                    new Models.Entities.Design
                    {
                        ArticleF = "TEST001",
                        Client = "Cliente de Prueba",
                        Description = "Diseño de prueba para verificar funcionamiento",
                        Substrate = "Sustrato de prueba",
                        Type = "LAMINA",
                        PrintType = "CARA",
                        ColorCount = 2,
                        Color1 = "Rojo",
                        Color2 = "Azul",
                        Status = "ACTIVO",
                        CreatedDate = DateTime.UtcNow,
                        LastModified = DateTime.UtcNow
                    }
                };

                _logger.LogInformation("💾 Inserting sample design using bulk insert...");
                
                // Usar el método de inserción masiva que sabemos que funciona
                await _designService.BulkInsertDesignsAsync(sampleDesigns);
                
                _logger.LogInformation("✅ Sample design created successfully");
                
                // Verificar que se creó
                var newCount = await _designService.GetDesignsCountAsync();
                
                return Ok(new { 
                    message = "Sample data created successfully",
                    createdCount = newCount - count,
                    totalCount = newCount,
                    design = new {
                        ArticleF = "TEST001",
                        Client = "Cliente de Prueba",
                        Description = "Diseño de prueba para verificar funcionamiento"
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creating sample data: {Message}", ex.Message);
                return BadRequest(new { 
                    error = "Error creating sample data",
                    message = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }



        /// <summary>
        /// Get all designs (OPTIMIZED)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetAllDesigns()
        {
            try
            {
                _logger.LogInformation("🚀 Getting all designs with optimizations...");
                var designs = await _designService.GetAllDesignsAsync();
                _logger.LogInformation($"✅ Successfully retrieved {designs.Count()} designs");
                return Ok(designs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting all designs");
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get ALL designs without pagination (for post-import loading)
        /// </summary>
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetAllDesignsNoPagination()
        {
            try
            {
                _logger.LogInformation("🚀 Getting ALL designs without pagination (post-import)...");
                
                // Verificar conexión a base de datos primero
                var designs = await _designService.GetAllDesignsAsync();
                var designsList = designs.ToList();
                
                _logger.LogInformation($"✅ Successfully retrieved ALL {designsList.Count} designs");
                
                // Si no hay diseños, devolver lista vacía con mensaje informativo
                if (designsList.Count == 0)
                {
                    _logger.LogWarning("⚠️ No designs found in database");
                    return Ok(new { 
                        designs = new List<DesignDto>(),
                        message = "No designs found in database",
                        count = 0,
                        timestamp = DateTime.UtcNow
                    });
                }
                
                // Log detalles de los primeros diseños para debugging
                _logger.LogInformation("📊 Primeros 3 diseños: {FirstDesigns}", 
                    string.Join(", ", designsList.Take(3).Select(d => $"{d.ArticleF} ({d.Client})")));
                
                return Ok(designsList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting all designs without pagination: {Message}", ex.Message);
                _logger.LogError(ex, "❌ Stack trace: {StackTrace}", ex.StackTrace);
                
                return BadRequest(new { 
                    error = "Error retrieving designs",
                    message = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get ALL designs with safe mapping (for debugging)
        /// </summary>
        [HttpGet("all-safe")]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetAllDesignsSafe()
        {
            try
            {
                _logger.LogInformation("🚀 Getting ALL designs with safe mapping...");
                
                var designs = await _designService.GetAllDesignsSafeAsync();
                var designsList = designs.ToList();
                
                _logger.LogInformation($"✅ Successfully retrieved ALL {designsList.Count} designs with safe mapping");
                
                return Ok(designsList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting designs with safe mapping: {Message}", ex.Message);
                
                return BadRequest(new { 
                    error = "Error retrieving designs with safe mapping",
                    message = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get designs with pagination (OPTIMIZED FOR LARGE DATASETS)
        /// </summary>
        [HttpGet("paginated")]
        public async Task<ActionResult<PaginatedDesignsDto>> GetDesignsPaginated(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 50,
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = "LastModified",
            [FromQuery] string? sortOrder = "desc")
        {
            try
            {
                _logger.LogInformation("🚀 Getting paginated designs - Page: {Page}, Size: {PageSize}", page, pageSize);
                
                var result = await _designService.GetDesignsPaginatedAsync(page, pageSize, search, sortBy, sortOrder);
                
                _logger.LogInformation("✅ Retrieved {Count} designs from page {Page}", result.Items.Count(), page);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting paginated designs");
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get designs summary (ULTRA FAST - Only essential fields)
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<IEnumerable<DesignSummaryDto>>> GetDesignsSummary()
        {
            try
            {
                _logger.LogInformation("⚡ Getting designs summary (fast load)...");
                var designs = await _designService.GetDesignsSummaryAsync();
                _logger.LogInformation($"✅ Retrieved {designs.Count()} design summaries");
                return Ok(designs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting designs summary");
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get designs with lazy loading (Load details on demand)
        /// </summary>
        [HttpGet("lazy")]
        public async Task<ActionResult<IEnumerable<DesignLazyDto>>> GetDesignsLazy()
        {
            try
            {
                _logger.LogInformation("🔄 Getting designs with lazy loading...");
                var designs = await _designService.GetDesignsLazyAsync();
                _logger.LogInformation($"✅ Retrieved {designs.Count()} lazy-loaded designs");
                return Ok(designs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting lazy designs");
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Load colors for a specific design (On-demand loading)
        /// </summary>
        [HttpGet("{id}/colors")]
        public async Task<ActionResult<List<string>>> LoadDesignColors(int id)
        {
            try
            {
                _logger.LogInformation("🎨 Loading colors for design {DesignId}", id);
                var colors = await _designService.LoadDesignColorsAsync(id);
                return Ok(colors);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error loading colors for design {DesignId}", id);
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Load full details for a specific design (On-demand loading)
        /// </summary>
        [HttpGet("{id}/details")]
        public async Task<ActionResult<DesignLazyDto>> LoadDesignDetails(int id)
        {
            try
            {
                _logger.LogInformation("📋 Loading full details for design {DesignId}", id);
                var design = await _designService.LoadDesignDetailsAsync(id);
                return Ok(design);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error loading details for design {DesignId}", id);
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get cache information
        /// </summary>
        [HttpGet("cache/info")]
        public async Task<ActionResult<DesignCacheInfoDto>> GetCacheInfo()
        {
            try
            {
                var cacheInfo = await _designService.GetCacheInfoAsync();
                return Ok(cacheInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting cache info");
                return StatusCode(500, new { 
                    error = "Internal server error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Clear cache
        /// </summary>
        [HttpPost("cache/clear")]
        public async Task<IActionResult> ClearCache()
        {
            try
            {
                var result = await _designService.ClearCacheAsync();
                return Ok(new { 
                    message = "Cache cleared successfully",
                    success = result,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error clearing cache");
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
        [RequestSizeLimit(300_000_000)] // 300MB limit para importación masiva
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
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
        private readonly IActivityLoggerService _activityLogger;

        public DesignsController(
            IDesignService designService,
            ILogger<DesignsController> logger,
            IActivityLoggerService activityLogger)
        {
            _designService = designService;
            _logger = logger;
            _activityLogger = activityLogger;
        }




        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Designs controller is working", timestamp = DateTime.UtcNow });
        }




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


        [HttpGet("test-ancho/{articleF}")]
        public async Task<IActionResult> TestAnchoMm(string articleF)
        {
            try
            {
                _logger.LogDebug($"🧪 Testing AnchoMm for article: {articleF}");
                
                var designs = await _designService.SearchDesignsAsync(articleF);
                var design = designs.FirstOrDefault();
                
                if (design == null)
                {
                    return NotFound(new { 
                        message = $"No design found for article {articleF}",
                        articleF = articleF
                    });
                }
                
                return Ok(new {
                    articleF = design.ArticleF,
                    anchoMm = design.AnchoMm,
                    hasAncho = design.AnchoMm.HasValue,
                    anchoValue = design.AnchoMm ?? 0,
                    client = design.Client,
                    fullDesign = design
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error testing AnchoMm for {articleF}");
                return StatusCode(500, new { error = ex.Message });
            }
        }




        [HttpGet("hello")]
        public string Hello()
        {
            return "Hello from DesignsController";
        }




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




        [HttpGet("all-raw")]
        public async Task<IActionResult> GetAllDesignsRaw()
        {
            try
            {
                _logger.LogDebug("🧪 Testing raw designs from database...");


                var designs = await _designService.GetAllDesignsRawAsync();
                var designsList = designs.ToList();

                _logger.LogDebug($"✅ Retrieved {designsList.Count} raw designs");

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
                    }),
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




        [HttpGet("db-test")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {

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








        [HttpGet]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetAllDesigns()
        {
            try
            {
                _logger.LogDebug("🚀 Getting all designs with optimizations...");
                var designs = await _designService.GetAllDesignsAsync();
                _logger.LogDebug($"✅ Successfully retrieved {designs.Count()} designs");


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "VIEW_DESIGNS",
                        "Consulta de catálogo de diseños",
                        "DESIGN",
                        $"{{\"count\":{designs.Count()}}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de consulta de diseños");
                }

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




        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetAllDesignsNoPagination()
        {
            try
            {
                _logger.LogDebug("🚀 Getting ALL designs without pagination (post-import)...");


                var designs = await _designService.GetAllDesignsAsync();
                var designsList = designs.ToList();

                _logger.LogDebug($"✅ Successfully retrieved ALL {designsList.Count} designs");


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


                _logger.LogDebug("📊 Primeros 3 diseños: {FirstDesigns}",
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




        [HttpGet("all-safe")]
        public async Task<ActionResult<IEnumerable<DesignDto>>> GetAllDesignsSafe()
        {
            try
            {
                _logger.LogDebug("🚀 Getting ALL designs with safe mapping...");

                var designs = await _designService.GetAllDesignsSafeAsync();
                var designsList = designs.ToList();

                _logger.LogDebug($"✅ Successfully retrieved ALL {designsList.Count} designs with safe mapping");

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
                _logger.LogDebug("🚀 Getting paginated designs - Page: {Page}, Size: {PageSize}", page, pageSize);

                var result = await _designService.GetDesignsPaginatedAsync(page, pageSize, search, sortBy, sortOrder);

                _logger.LogDebug("✅ Retrieved {Count} designs from page {Page}", result.Items.Count(), page);
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




        [HttpGet("summary")]
        public async Task<ActionResult<IEnumerable<DesignSummaryDto>>> GetDesignsSummary()
        {
            try
            {
                _logger.LogDebug("⚡ Getting designs summary (fast load)...");
                var designs = await _designService.GetDesignsSummaryAsync();
                _logger.LogDebug($"✅ Retrieved {designs.Count()} design summaries");
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




        [HttpGet("lazy")]
        public async Task<ActionResult<IEnumerable<DesignLazyDto>>> GetDesignsLazy()
        {
            try
            {
                _logger.LogDebug("🔄 Getting designs with lazy loading...");
                var designs = await _designService.GetDesignsLazyAsync();
                _logger.LogDebug($"✅ Retrieved {designs.Count()} lazy-loaded designs");
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




        [HttpGet("{id}/colors")]
        public async Task<ActionResult<List<string>>> LoadDesignColors(int id)
        {
            try
            {
                _logger.LogDebug("🎨 Loading colors for design {DesignId}", id);
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




        [HttpGet("{id}/details")]
        public async Task<ActionResult<DesignLazyDto>> LoadDesignDetails(int id)
        {
            try
            {
                _logger.LogDebug("📋 Loading full details for design {DesignId}", id);
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




        [HttpPost]
        public async Task<ActionResult<DesignDto>> CreateDesign([FromBody] CreateDesignDto createDto)
        {
            try
            {
                _logger.LogDebug("🎨 Creating new design: {@CreateDto}", createDto);

                var userId = 1;
                var design = await _designService.CreateDesignAsync(createDto, userId);


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "CREATE_DESIGN",
                        $"Creación de nuevo diseño: {createDto.ArticleF}",
                        "DESIGN",
                        $"{{\"articleF\":\"{createDto.ArticleF}\",\"client\":\"{createDto.Client}\",\"designId\":{design.Id}}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de creación de diseño");
                }

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




        [HttpPut("{id}")]
        public async Task<ActionResult<DesignDto>> UpdateDesign(int id, [FromBody] UpdateDesignDto updateDto)
        {
            try
            {
                var userId = 1;
                var design = await _designService.UpdateDesignAsync(id, updateDto, userId);


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "UPDATE_DESIGN",
                        $"Modificación de diseño ID: {id}",
                        "DESIGN",
                        $"{{\"designId\":{id},\"articleF\":\"{design.ArticleF}\"}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de actualización de diseño");
                }

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


                try
                {
                    await _activityLogger.LogActivityAsync(
                        "DELETE_DESIGN",
                        $"Eliminación de diseño ID: {id}",
                        "DESIGN",
                        $"{{\"designId\":{id}}}"
                    );
                }
                catch (Exception logEx)
                {
                    _logger.LogWarning(logEx, "Error registrando actividad de eliminación de diseño");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting design with ID: {DesignId}", id);
                return StatusCode(500, "Internal server error");
            }
        }




        [HttpPost("{id}/duplicate")]
        public async Task<ActionResult<DesignDto>> DuplicateDesign(int id)
        {
            try
            {
                var userId = 1;
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




        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateDesignStatus(int id, [FromBody] DesignStatusUpdateDto statusDto)
        {
            try
            {
                var userId = 1;
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




        [HttpPost("import/excel")]
        [RequestSizeLimit(300_000_000)]
        public async Task<IActionResult> ImportFromExcel(IFormFile file)
        {
            try
            {
                _logger.LogDebug("🚀 Starting massive Excel import process...");

                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { error = "No file uploaded" });
                }

                if (!file.FileName.EndsWith(".xlsx") && !file.FileName.EndsWith(".xls"))
                {
                    return BadRequest(new { error = "Only Excel files (.xlsx, .xls) are allowed" });
                }

                _logger.LogDebug($"📁 Processing file: {file.FileName} ({file.Length / 1024 / 1024:F2} MB)");

                var result = await _designService.ImportFromExcelAsync(file);

                _logger.LogDebug($"✅ Import completed: {result.SuccessCount} successful, {result.ErrorCount} errors");

                return Ok(new {
                    message = "Excel import completed successfully",
                    successCount = result.SuccessCount,
                    errorCount = result.ErrorCount,
                    errors = result.Errors.Take(10),
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




        [HttpPost("clear-all")]
        public async Task<IActionResult> ClearAllDesigns()
        {
            try
            {
                _logger.LogDebug("🗑️ Clearing all existing designs...");

                var deletedCount = await _designService.ClearAllDesignsAsync();

                _logger.LogDebug($"✅ Cleared {deletedCount} designs from database");

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



        [HttpGet("unique-colors")]
        public async Task<IActionResult> GetUniqueColors()
        {
            try
            {
                var colors = await _designService.GetUniqueUsedColorsAsync();
                return Ok(colors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unique colors");
                return StatusCode(500, "Internal server error");
            }
        }




        [HttpGet("pantone-colors/{articleF}")]
        public async Task<IActionResult> GetPantoneColorsByArticle(string articleF)
        {
            try
            {
                var pantoneColors = await _designService.GetPantoneColorsByArticleAsync(articleF);

                return Ok(new {
                    articleF = articleF,
                    pantoneCount = pantoneColors.Count,
                    pantoneColors = pantoneColors,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting Pantone colors for article {articleF}");
                // Degradar a vacío: no romper reportes/consulta por un artículo sin diseño
                return Ok(new {
                    articleF = articleF,
                    pantoneCount = 0,
                    pantoneColors = Array.Empty<string>(),
                    timestamp = DateTime.UtcNow,
                    warning = ex.Message
                });
            }
        }




        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<DesignDto>>> SearchDesigns([FromQuery] string search)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(search))
                {
                    return BadRequest(new { error = "Search parameter is required" });
                }

                _logger.LogDebug($"🔍 Searching designs with query: {search}");
                
                var designs = await _designService.SearchDesignsAsync(search);
                
                _logger.LogDebug($"✅ Found {designs.Count()} designs matching '{search}'");
                
                return Ok(designs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching designs with query: {search}");
                return StatusCode(500, new {
                    error = "Error searching designs",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
    }
}
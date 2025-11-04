using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Repositories;
using System.Text.Json;

namespace FlexoAPP.API.Services
{
    public class DesignService : IDesignService
    {
        private readonly IDesignRepository _designRepository;
        private readonly ILogger<DesignService> _logger;

        public DesignService(IDesignRepository designRepository, ILogger<DesignService> logger)
        {
            _designRepository = designRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<DesignDto>> GetAllDesignsAsync()
        {
            try
            {
                var designs = await _designRepository.GetAllDesignsAsync();
                return designs.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting designs from database");
                throw; // Let the controller handle the error
            }
        }

        public async Task<DesignDto?> GetDesignByIdAsync(int id)
        {
            var design = await _designRepository.GetDesignByIdAsync(id);
            return design != null ? MapToDto(design) : null;
        }

        public async Task<DesignDto?> GetDesignByArticleFAsync(string articleF)
        {
            var design = await _designRepository.GetDesignByArticleFAsync(articleF);
            return design != null ? MapToDto(design) : null;
        }

        public async Task<DesignDto> CreateDesignAsync(CreateDesignDto createDto, int userId)
        {
            // Validate the design
            if (!await ValidateDesignAsync(createDto))
            {
                throw new ArgumentException("Invalid design data");
            }

            // Check if ArticleF already exists
            if (await _designRepository.ArticleFExistsAsync(createDto.ArticleF))
            {
                throw new InvalidOperationException($"Design with ArticleF '{createDto.ArticleF}' already exists");
            }

            var design = new Design
            {
                ArticleF = createDto.ArticleF,
                Client = createDto.Client,
                Description = createDto.Description,
                Substrate = createDto.Substrate,
                Type = createDto.Type,
                PrintType = createDto.PrintType,
                ColorCount = createDto.ColorCount,
                Color1 = createDto.Colors.Count > 0 ? createDto.Colors[0] : null,
                Color2 = createDto.Colors.Count > 1 ? createDto.Colors[1] : null,
                Color3 = createDto.Colors.Count > 2 ? createDto.Colors[2] : null,
                Color4 = createDto.Colors.Count > 3 ? createDto.Colors[3] : null,
                Color5 = createDto.Colors.Count > 4 ? createDto.Colors[4] : null,
                Color6 = createDto.Colors.Count > 5 ? createDto.Colors[5] : null,
                Color7 = createDto.Colors.Count > 6 ? createDto.Colors[6] : null,
                Color8 = createDto.Colors.Count > 7 ? createDto.Colors[7] : null,
                Color9 = createDto.Colors.Count > 8 ? createDto.Colors[8] : null,
                Color10 = createDto.Colors.Count > 9 ? createDto.Colors[9] : null,
                Status = createDto.Status,
                CreatedDate = DateTime.UtcNow,
                LastModified = DateTime.UtcNow
            };

            var createdDesign = await _designRepository.CreateDesignAsync(design);
            _logger.LogInformation("Design created with ID: {DesignId} by User: {UserId}", createdDesign.Id, userId);
            
            return MapToDto(createdDesign);
        }

        public async Task<DesignDto> UpdateDesignAsync(int id, UpdateDesignDto updateDto, int userId)
        {
            var existingDesign = await _designRepository.GetDesignByIdAsync(id);
            if (existingDesign == null)
            {
                throw new KeyNotFoundException($"Design with ID {id} not found");
            }

            // Validate the update
            if (!await ValidateDesignUpdateAsync(id, updateDto))
            {
                throw new ArgumentException("Invalid design update data");
            }

            // Check if ArticleF already exists (excluding current design)
            if (!string.IsNullOrEmpty(updateDto.ArticleF) && 
                await _designRepository.ArticleFExistsAsync(updateDto.ArticleF, id))
            {
                throw new InvalidOperationException($"Design with ArticleF '{updateDto.ArticleF}' already exists");
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(updateDto.ArticleF))
                existingDesign.ArticleF = updateDto.ArticleF;
            if (!string.IsNullOrEmpty(updateDto.Client))
                existingDesign.Client = updateDto.Client;
            if (!string.IsNullOrEmpty(updateDto.Description))
                existingDesign.Description = updateDto.Description;
            if (!string.IsNullOrEmpty(updateDto.Substrate))
                existingDesign.Substrate = updateDto.Substrate;
            if (!string.IsNullOrEmpty(updateDto.Type))
                existingDesign.Type = updateDto.Type;
            if (!string.IsNullOrEmpty(updateDto.PrintType))
                existingDesign.PrintType = updateDto.PrintType;
            if (updateDto.ColorCount.HasValue)
                existingDesign.ColorCount = updateDto.ColorCount.Value;
            if (updateDto.Colors != null && updateDto.Colors.Any())
            {
                existingDesign.Color1 = updateDto.Colors.Count > 0 ? updateDto.Colors[0] : null;
                existingDesign.Color2 = updateDto.Colors.Count > 1 ? updateDto.Colors[1] : null;
                existingDesign.Color3 = updateDto.Colors.Count > 2 ? updateDto.Colors[2] : null;
                existingDesign.Color4 = updateDto.Colors.Count > 3 ? updateDto.Colors[3] : null;
                existingDesign.Color5 = updateDto.Colors.Count > 4 ? updateDto.Colors[4] : null;
                existingDesign.Color6 = updateDto.Colors.Count > 5 ? updateDto.Colors[5] : null;
                existingDesign.Color7 = updateDto.Colors.Count > 6 ? updateDto.Colors[6] : null;
                existingDesign.Color8 = updateDto.Colors.Count > 7 ? updateDto.Colors[7] : null;
                existingDesign.Color9 = updateDto.Colors.Count > 8 ? updateDto.Colors[8] : null;
                existingDesign.Color10 = updateDto.Colors.Count > 9 ? updateDto.Colors[9] : null;
            }

            if (!string.IsNullOrEmpty(updateDto.Status))
                existingDesign.Status = updateDto.Status;

            var updatedDesign = await _designRepository.UpdateDesignAsync(existingDesign);
            _logger.LogInformation("Design updated with ID: {DesignId} by User: {UserId}", id, userId);
            
            return MapToDto(updatedDesign);
        }

        public async Task<bool> DeleteDesignAsync(int id)
        {
            var exists = await _designRepository.DesignExistsAsync(id);
            if (!exists)
            {
                return false;
            }

            var result = await _designRepository.DeleteDesignAsync(id);
            if (result)
            {
                _logger.LogInformation("Design deleted with ID: {DesignId}", id);
            }
            
            return result;
        }

        public async Task<DesignDto> DuplicateDesignAsync(int id, int userId)
        {
            var originalDesign = await _designRepository.GetDesignByIdAsync(id);
            if (originalDesign == null)
            {
                throw new KeyNotFoundException($"Design with ID {id} not found");
            }

            // Create a new ArticleF for the duplicate
            var baseArticleF = originalDesign.ArticleF ?? "COPY";
            var newArticleF = await GenerateUniqueArticleFAsync(baseArticleF);

            var duplicateDesign = new Design
            {
                ArticleF = newArticleF,
                Client = originalDesign.Client,
                Description = $"{originalDesign.Description} (Copia)",
                Substrate = originalDesign.Substrate,
                Type = originalDesign.Type,
                PrintType = originalDesign.PrintType,
                ColorCount = originalDesign.ColorCount,
                Color1 = originalDesign.Color1,
                Color2 = originalDesign.Color2,
                Color3 = originalDesign.Color3,
                Color4 = originalDesign.Color4,
                Color5 = originalDesign.Color5,
                Color6 = originalDesign.Color6,
                Color7 = originalDesign.Color7,
                Color8 = originalDesign.Color8,
                Color9 = originalDesign.Color9,
                Color10 = originalDesign.Color10,
                Status = "ACTIVO", // Always set duplicates as active

                CreatedDate = DateTime.UtcNow,
                LastModified = DateTime.UtcNow
            };

            var createdDesign = await _designRepository.CreateDesignAsync(duplicateDesign);
            _logger.LogInformation("Design duplicated from ID: {OriginalId} to new ID: {NewId} by User: {UserId}", 
                id, createdDesign.Id, userId);
            
            return MapToDto(createdDesign);
        }

        public async Task<DesignListResponseDto> SearchDesignsAsync(DesignSearchDto searchDto)
        {
            var (designs, totalCount) = await _designRepository.SearchDesignsAsync(searchDto);
            var totalPages = (int)Math.Ceiling((double)totalCount / searchDto.PageSize);

            return new DesignListResponseDto
            {
                Designs = designs.Select(MapToDto),
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize,
                TotalPages = totalPages
            };
        }

        public async Task<DesignStatsDto> GetDesignStatsAsync()
        {
            return await _designRepository.GetDesignStatsAsync();
        }

        public async Task<IEnumerable<DesignDto>> CreateMultipleDesignsAsync(BulkCreateDesignDto bulkDto, int userId)
        {
            var designs = new List<Design>();
            
            foreach (var createDto in bulkDto.Designs)
            {
                // Validate each design
                if (!await ValidateDesignAsync(createDto))
                {
                    throw new ArgumentException($"Invalid design data for ArticleF: {createDto.ArticleF}");
                }

                // Check if ArticleF already exists
                if (await _designRepository.ArticleFExistsAsync(createDto.ArticleF))
                {
                    throw new InvalidOperationException($"Design with ArticleF '{createDto.ArticleF}' already exists");
                }

                designs.Add(new Design
                {
                    ArticleF = createDto.ArticleF,
                    Client = createDto.Client,
                    Description = createDto.Description,
                    Substrate = createDto.Substrate,
                    Type = createDto.Type,
                    PrintType = createDto.PrintType,
                    ColorCount = createDto.ColorCount,
                    Color1 = createDto.Colors.Count > 0 ? createDto.Colors[0] : null,
                    Color2 = createDto.Colors.Count > 1 ? createDto.Colors[1] : null,
                    Color3 = createDto.Colors.Count > 2 ? createDto.Colors[2] : null,
                    Color4 = createDto.Colors.Count > 3 ? createDto.Colors[3] : null,
                    Color5 = createDto.Colors.Count > 4 ? createDto.Colors[4] : null,
                    Color6 = createDto.Colors.Count > 5 ? createDto.Colors[5] : null,
                    Color7 = createDto.Colors.Count > 6 ? createDto.Colors[6] : null,
                    Color8 = createDto.Colors.Count > 7 ? createDto.Colors[7] : null,
                    Color9 = createDto.Colors.Count > 8 ? createDto.Colors[8] : null,
                    Color10 = createDto.Colors.Count > 9 ? createDto.Colors[9] : null,
                    Status = createDto.Status,

                    CreatedDate = DateTime.UtcNow,
                    LastModified = DateTime.UtcNow
                });
            }

            var createdDesigns = await _designRepository.CreateMultipleDesignsAsync(designs);
            _logger.LogInformation("Bulk created {Count} designs by User: {UserId}", designs.Count, userId);
            
            return createdDesigns.Select(MapToDto);
        }

        public async Task<bool> UpdateDesignStatusAsync(int id, string status, int userId)
        {
            if (string.IsNullOrEmpty(status) || (status != "ACTIVO" && status != "INACTIVO"))
            {
                throw new ArgumentException("Status must be either 'ACTIVO' or 'INACTIVO'");
            }

            var result = await _designRepository.UpdateDesignStatusAsync(id, status, userId);
            if (result)
            {
                _logger.LogInformation("Design status updated for ID: {DesignId} to {Status} by User: {UserId}", 
                    id, status, userId);
            }
            
            return result;
        }

        public async Task<DesignFiltersDto> GetDesignFiltersAsync()
        {
            var clients = await _designRepository.GetUniqueClientsAsync();

            var substrates = await _designRepository.GetUniqueSubstratesAsync();

            return new DesignFiltersDto
            {
                Clients = clients,
                Substrates = substrates
            };
        }

        public async Task<IEnumerable<DesignDto>> GetRecentDesignsAsync(int count = 10)
        {
            var designs = await _designRepository.GetRecentDesignsAsync(count);
            return designs.Select(MapToDto);
        }

        public async Task<byte[]> ExportToExcelAsync()
        {
            try
            {
                var designs = await GetAllDesignsAsync();
                return GenerateExcelFile(designs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting designs to Excel");
                throw;
            }
        }

        public async Task<bool> ClearTestDataAsync()
        {
            try
            {
                var testDesigns = await _designRepository.GetTestDesignsAsync();
                foreach (var design in testDesigns)
                {
                    await _designRepository.DeleteDesignAsync(design.Id);
                }
                _logger.LogInformation("Test data cleared successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing test data");
                return false;
            }
        }

        public Task<bool> ValidateDesignAsync(CreateDesignDto design)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(design.ArticleF) ||
                string.IsNullOrWhiteSpace(design.Client) ||
                string.IsNullOrWhiteSpace(design.Description) ||
                string.IsNullOrWhiteSpace(design.Substrate) ||
                string.IsNullOrWhiteSpace(design.Type) ||
                string.IsNullOrWhiteSpace(design.PrintType) ||
                design.ColorCount <= 0)
            {
                return Task.FromResult(false);
            }

            // Validate enums
            var validTypes = new[] { "LAMINA", "TUBULAR", "SEMITUBULAR" };
            var validPrintTypes = new[] { "CARA", "DORSO", "CARA_DORSO" };
            var validStatuses = new[] { "ACTIVO", "INACTIVO" };

            if (!validTypes.Contains(design.Type) ||
                !validPrintTypes.Contains(design.PrintType) ||
                !validStatuses.Contains(design.Status))
            {
                return Task.FromResult(false);
            }

            // Validate color count matches colors array
            if (design.ColorCount != design.Colors.Count)
            {
                return Task.FromResult(false);
            }

            return Task.FromResult(true);
        }

        public Task<bool> ValidateDesignUpdateAsync(int id, UpdateDesignDto design)
        {
            // Validate enums if provided
            if (!string.IsNullOrEmpty(design.Type))
            {
                var validTypes = new[] { "LAMINA", "TUBULAR", "SEMITUBULAR" };
                if (!validTypes.Contains(design.Type))
                    return Task.FromResult(false);
            }

            if (!string.IsNullOrEmpty(design.PrintType))
            {
                var validPrintTypes = new[] { "CARA", "DORSO", "CARA_DORSO" };
                if (!validPrintTypes.Contains(design.PrintType))
                    return Task.FromResult(false);
            }

            if (!string.IsNullOrEmpty(design.Status))
            {
                var validStatuses = new[] { "ACTIVO", "INACTIVO" };
                if (!validStatuses.Contains(design.Status))
                    return Task.FromResult(false);
            }

            // Validate color count matches colors array if both are provided
            if (design.ColorCount.HasValue && design.Colors != null)
            {
                if (design.ColorCount.Value != design.Colors.Count)
                    return Task.FromResult(false);
            }

            return Task.FromResult(true);
        }

        private async Task<string> GenerateUniqueArticleFAsync(string baseArticleF)
        {
            var counter = 1;
            string newArticleF;
            
            do
            {
                newArticleF = $"{baseArticleF}_COPIA{counter}";
                counter++;
            } 
            while (await _designRepository.ArticleFExistsAsync(newArticleF));
            
            return newArticleF;
        }

        private static DesignDto MapToDto(Design design)
        {
            var colors = new List<string>();
            
            // Convertir las columnas separadas de colores a una lista
            if (!string.IsNullOrEmpty(design.Color1)) colors.Add(design.Color1);
            if (!string.IsNullOrEmpty(design.Color2)) colors.Add(design.Color2);
            if (!string.IsNullOrEmpty(design.Color3)) colors.Add(design.Color3);
            if (!string.IsNullOrEmpty(design.Color4)) colors.Add(design.Color4);
            if (!string.IsNullOrEmpty(design.Color5)) colors.Add(design.Color5);
            if (!string.IsNullOrEmpty(design.Color6)) colors.Add(design.Color6);
            if (!string.IsNullOrEmpty(design.Color7)) colors.Add(design.Color7);
            if (!string.IsNullOrEmpty(design.Color8)) colors.Add(design.Color8);
            if (!string.IsNullOrEmpty(design.Color9)) colors.Add(design.Color9);
            if (!string.IsNullOrEmpty(design.Color10)) colors.Add(design.Color10);

            return new DesignDto
            {
                Id = design.Id,
                ArticleF = design.ArticleF ?? string.Empty,
                Client = design.Client ?? string.Empty,
                Description = design.Description ?? string.Empty,
                Substrate = design.Substrate ?? string.Empty,
                Type = design.Type ?? string.Empty,
                PrintType = design.PrintType ?? string.Empty,
                ColorCount = design.ColorCount ?? 0,
                Colors = colors,
                Status = design.Status ?? "ACTIVO",
                CreatedDate = design.CreatedDate ?? DateTime.UtcNow,
                LastModified = design.LastModified ?? DateTime.UtcNow,

                CreatedByUserId = design.CreatedByUserId ?? 0,
                CreatedByUserName = design.CreatedBy != null ? $"{design.CreatedBy.FirstName} {design.CreatedBy.LastName}".Trim() : null
            };
        }

        private static IEnumerable<DesignDto> GetMockDesigns()
        {
            return new List<DesignDto>
            {
                new DesignDto
                {
                    Id = 1,
                    ArticleF = "F204567",
                    Client = "ABSORBENTES DE COLOMBIA S.A",
                    Description = "IMP BL PROTECTORES MULTIESTILO SERENITY 60und",
                    Substrate = "R PE COEX BCO",
                    Type = "LAMINA",
                    PrintType = "CARA",
                    ColorCount = 4,
                    Colors = new List<string> { "CYAN", "MAGENTA", "YELLOW", "BLACK" },
                    Status = "ACTIVO",
                    CreatedDate = DateTime.Now.AddDays(-10),
                    LastModified = DateTime.Now.AddDays(-2),

                    CreatedByUserId = 1,
                    CreatedByUserName = "Admin"
                },
                new DesignDto
                {
                    Id = 2,
                    ArticleF = "F205123",
                    Client = "PRODUCTOS FAMILIA S.A",
                    Description = "IMP TOALLAS NOSOTRAS INVISIBLE ULTRA 10und",
                    Substrate = "R PE COEX TRANS",
                    Type = "TUBULAR",
                    PrintType = "DORSO",
                    ColorCount = 6,
                    Colors = new List<string> { "CYAN", "MAGENTA", "YELLOW", "BLACK", "BLANCO OPACO", "PANTONE 15-0343 TPX" },
                    Status = "ACTIVO",
                    CreatedDate = DateTime.Now.AddDays(-8),
                    LastModified = DateTime.Now.AddDays(-1),

                    CreatedByUserId = 1,
                    CreatedByUserName = "Admin"
                },
                new DesignDto
                {
                    Id = 3,
                    ArticleF = "F206789",
                    Client = "KIMBERLY CLARK COLOMBIA",
                    Description = "IMP PAÑALES HUGGIES ACTIVE SEC ETAPA 3",
                    Substrate = "BOPP PERLADO",
                    Type = "SEMITUBULAR",
                    PrintType = "CARA_DORSO",
                    ColorCount = 8,
                    Colors = new List<string> { "CYAN", "MAGENTA", "YELLOW", "BLACK", "BLANCO OPACO", "PANTONE 15-0343 TPX", "PANTONE 18-1750 TPX", "PANTONE 19-4052 TPX" },
                    Status = "ACTIVO",
                    CreatedDate = DateTime.Now.AddDays(-5),
                    LastModified = DateTime.Now,

                    CreatedByUserId = 1,
                    CreatedByUserName = "Admin"
                },
                new DesignDto
                {
                    Id = 4,
                    ArticleF = "F207456",
                    Client = "UNILEVER ANDINA COLOMBIA",
                    Description = "IMP BOLSA DETERGENTE FAB LIMÓN 1KG",
                    Substrate = "R PP COEX BCO",
                    Type = "LAMINA",
                    PrintType = "CARA",
                    ColorCount = 5,
                    Colors = new List<string> { "CYAN", "MAGENTA", "YELLOW", "BLACK", "PANTONE 15-0343 TPX" },
                    Status = "INACTIVO",
                    CreatedDate = DateTime.Now.AddDays(-3),
                    LastModified = DateTime.Now.AddHours(-5),

                    CreatedByUserId = 1,
                    CreatedByUserName = "Admin"
                }
            };
        }

        private static byte[] GenerateExcelFile(IEnumerable<DesignDto> designs)
        {
            // Crear contenido CSV que se puede abrir en Excel
            var csv = new System.Text.StringBuilder();
            
            // Encabezados
            csv.AppendLine("ArticleF,Cliente,Descripción,Sustrato,Tipo,Tipo de Impresión,Cantidad de Colores,Color1,Color2,Color3,Color4,Color5,Color6,Color7,Color8,Color9,Color10,Diseñador,Estado,Fecha de Creación,Última Modificación");
            
            // Datos
            foreach (var design in designs)
            {
                var colors = design.Colors ?? new List<string>();
                var row = $"\"{design.ArticleF}\"," +
                         $"\"{design.Client}\"," +
                         $"\"{design.Description}\"," +
                         $"\"{design.Substrate}\"," +
                         $"\"{design.Type}\"," +
                         $"\"{design.PrintType}\"," +
                         $"{design.ColorCount}," +
                         $"\"{(colors.Count > 0 ? colors[0] : "")}\"," +
                         $"\"{(colors.Count > 1 ? colors[1] : "")}\"," +
                         $"\"{(colors.Count > 2 ? colors[2] : "")}\"," +
                         $"\"{(colors.Count > 3 ? colors[3] : "")}\"," +
                         $"\"{(colors.Count > 4 ? colors[4] : "")}\"," +
                         $"\"{(colors.Count > 5 ? colors[5] : "")}\"," +
                         $"\"{(colors.Count > 6 ? colors[6] : "")}\"," +
                         $"\"{(colors.Count > 7 ? colors[7] : "")}\"," +
                         $"\"{(colors.Count > 8 ? colors[8] : "")}\"," +
                         $"\"{(colors.Count > 9 ? colors[9] : "")}\"," +

                         $"\"{design.Status}\"," +
                         $"\"{design.CreatedDate:yyyy-MM-dd HH:mm:ss}\"," +
                         $"\"{design.LastModified:yyyy-MM-dd HH:mm:ss}\"";
                
                csv.AppendLine(row);
            }
            
            // Convertir a bytes con BOM para que Excel lo reconozca como UTF-8
            var preamble = System.Text.Encoding.UTF8.GetPreamble();
            var csvBytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
            var result = new byte[preamble.Length + csvBytes.Length];
            preamble.CopyTo(result, 0);
            csvBytes.CopyTo(result, preamble.Length);
            
            return result;
        }

        public async Task<ImportResultDto> ImportFromExcelAsync(IFormFile file)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var result = new ImportResultDto
            {
                FileName = file.FileName
            };

            try
            {
                _logger.LogInformation("🚀 Starting Excel import process for file: {FileName}", file.FileName);

                using var stream = file.OpenReadStream();
                using var package = new OfficeOpenXml.ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets[0];
                
                var rowCount = worksheet.Dimension?.Rows ?? 0;
                _logger.LogInformation("📊 Found {RowCount} rows in Excel file", rowCount);

                if (rowCount <= 1)
                {
                    result.Errors.Add("El archivo Excel está vacío o solo contiene headers");
                    return result;
                }

                var batchSize = 50; // Process in smaller batches for large files
                var totalBatches = (int)Math.Ceiling((double)(rowCount - 1) / batchSize);
                
                _logger.LogInformation("🔄 Processing {TotalBatches} batches of {BatchSize} records each", totalBatches, batchSize);

                for (int batchIndex = 0; batchIndex < totalBatches; batchIndex++)
                {
                    var startRow = 2 + (batchIndex * batchSize); // Skip header row
                    var endRow = Math.Min(startRow + batchSize - 1, rowCount);
                    
                    _logger.LogInformation("📦 Processing batch {BatchIndex}/{TotalBatches} (rows {StartRow}-{EndRow})", 
                        batchIndex + 1, totalBatches, startRow, endRow);

                    var designs = new List<Models.Entities.Design>();

                    for (int row = startRow; row <= endRow; row++)
                    {
                        try
                        {
                            var design = ParseExcelRowToDesign(worksheet, row);
                            if (design != null)
                            {
                                designs.Add(design);
                            }
                        }
                        catch (Exception ex)
                        {
                            result.ErrorCount++;
                            result.Errors.Add($"Row {row}: {ex.Message}");
                            _logger.LogWarning("⚠️ Error processing row {Row}: {Error}", row, ex.Message);
                        }
                    }

                    // Bulk insert batch
                    if (designs.Any())
                    {
                        try
                        {
                            await _designRepository.BulkInsertDesignsAsync(designs);
                            result.SuccessCount += designs.Count;
                            _logger.LogInformation("✅ Successfully inserted batch {BatchIndex}: {Count} records", 
                                batchIndex + 1, designs.Count);
                        }
                        catch (Exception ex)
                        {
                            result.ErrorCount += designs.Count;
                            result.Errors.Add($"Batch {batchIndex + 1}: {ex.Message}");
                            _logger.LogError(ex, "❌ Error inserting batch {BatchIndex}", batchIndex + 1);
                        }
                    }
                }

                stopwatch.Stop();
                result.ProcessingTime = stopwatch.Elapsed;
                
                _logger.LogInformation("🎉 Import completed: {SuccessCount} successful, {ErrorCount} errors in {ProcessingTime}", 
                    result.SuccessCount, result.ErrorCount, result.ProcessingTime);

                return result;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                result.ProcessingTime = stopwatch.Elapsed;
                result.Errors.Add($"General error: {ex.Message}");
                _logger.LogError(ex, "❌ Critical error during Excel import");
                throw;
            }
        }

        private Models.Entities.Design? ParseExcelRowToDesign(OfficeOpenXml.ExcelWorksheet worksheet, int row)
        {
            try
            {
                // Columna 1: ID (no incremental)
                var idText = worksheet.Cells[row, 1].Text?.Trim();
                if (string.IsNullOrEmpty(idText))
                {
                    return null; // Skip empty rows
                }

                // Columna 2: ArticleF
                var articleF = worksheet.Cells[row, 2].Text?.Trim();
                if (string.IsNullOrEmpty(articleF))
                {
                    return null; // Skip rows without ArticleF
                }

                var design = new Models.Entities.Design
                {
                    // Usar el ID del Excel si es válido, sino generar uno temporal
                    Id = int.TryParse(idText, out var parsedId) ? parsedId : 0,
                    ArticleF = articleF,
                    Client = worksheet.Cells[row, 3].Text?.Trim() ?? "",
                    Description = worksheet.Cells[row, 4].Text?.Trim() ?? "",
                    Substrate = worksheet.Cells[row, 5].Text?.Trim() ?? "",
                    Type = worksheet.Cells[row, 6].Text?.Trim() ?? "LAMINA",
                    PrintType = worksheet.Cells[row, 7].Text?.Trim() ?? "CARA",
                    ColorCount = int.TryParse(worksheet.Cells[row, 8].Text, out var colorCount) ? colorCount : 1,
                    Color1 = worksheet.Cells[row, 9].Text?.Trim(),
                    Color2 = worksheet.Cells[row, 10].Text?.Trim(),
                    Color3 = worksheet.Cells[row, 11].Text?.Trim(),
                    Color4 = worksheet.Cells[row, 12].Text?.Trim(),
                    Color5 = worksheet.Cells[row, 13].Text?.Trim(),
                    Color6 = worksheet.Cells[row, 14].Text?.Trim(),
                    Color7 = worksheet.Cells[row, 15].Text?.Trim(),
                    Color8 = worksheet.Cells[row, 16].Text?.Trim(),
                    Color9 = worksheet.Cells[row, 17].Text?.Trim(),
                    Color10 = worksheet.Cells[row, 18].Text?.Trim(),

                    Status = worksheet.Cells[row, 20].Text?.Trim() ?? "ACTIVO",
                    CreatedDate = DateTime.UtcNow,
                    LastModified = DateTime.UtcNow
                };

                return design;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error parsing row data: {ex.Message}");
            }
        }

        public async Task<int> ClearAllDesignsAsync()
        {
            _logger.LogInformation("🗑️ Clearing all designs from database...");
            
            var deletedCount = await _designRepository.ClearAllDesignsAsync();
            
            _logger.LogInformation("✅ Cleared {DeletedCount} designs", deletedCount);
            
            return deletedCount;
        }

        // ===== OPTIMIZED METHODS FOR FAST LOADING =====

        /// <summary>
        /// Get designs with pagination (OPTIMIZED)
        /// </summary>
        public async Task<PaginatedDesignsDto> GetDesignsPaginatedAsync(
            int page, int pageSize, string? search = null, string? sortBy = "LastModified", string? sortOrder = "desc")
        {
            var startTime = DateTime.UtcNow;
            
            try
            {
                _logger.LogInformation("🚀 Getting paginated designs - Page: {Page}, Size: {PageSize}", page, pageSize);
                
                var (designs, totalCount) = await _designRepository.GetDesignsPaginatedAsync(page, pageSize, search, sortBy, sortOrder);
                
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var loadTime = DateTime.UtcNow - startTime;
                
                var result = new PaginatedDesignsDto
                {
                    Items = designs.Select(MapToDto),
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages,
                    HasNextPage = page < totalPages,
                    HasPreviousPage = page > 1,
                    LoadTime = loadTime
                };
                
                _logger.LogInformation("✅ Retrieved {Count} designs in {LoadTime}ms", designs.Count(), loadTime.TotalMilliseconds);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting paginated designs");
                throw;
            }
        }

        /// <summary>
        /// Get designs summary (ULTRA FAST - Only essential fields)
        /// </summary>
        public async Task<IEnumerable<DesignSummaryDto>> GetDesignsSummaryAsync()
        {
            var startTime = DateTime.UtcNow;
            
            try
            {
                _logger.LogInformation("⚡ Getting designs summary (ultra fast)...");
                
                var designs = await _designRepository.GetDesignsSummaryAsync();
                
                var result = designs.Select(d => new DesignSummaryDto
                {
                    Id = d.Id,
                    ArticleF = d.ArticleF ?? string.Empty,
                    Client = d.Client ?? string.Empty,
                    Status = d.Status ?? string.Empty,
                    ColorCount = d.ColorCount ?? 0,
                    LastModified = d.LastModified ?? DateTime.UtcNow
                });
                
                var loadTime = DateTime.UtcNow - startTime;
                _logger.LogInformation("✅ Retrieved {Count} design summaries in {LoadTime}ms", result.Count(), loadTime.TotalMilliseconds);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting designs summary");
                throw;
            }
        }

        /// <summary>
        /// Get designs with lazy loading (Load details on demand)
        /// </summary>
        public async Task<IEnumerable<DesignLazyDto>> GetDesignsLazyAsync()
        {
            var startTime = DateTime.UtcNow;
            
            try
            {
                _logger.LogInformation("🔄 Getting designs with lazy loading...");
                
                var designs = await _designRepository.GetDesignsLazyAsync();
                
                var result = designs.Select(d => new DesignLazyDto
                {
                    Id = d.Id,
                    ArticleF = d.ArticleF ?? string.Empty,
                    Client = d.Client ?? string.Empty,
                    Description = d.Description ?? string.Empty,
                    Status = d.Status ?? string.Empty,
                    ColorCount = d.ColorCount ?? 0,
                    LastModified = d.LastModified ?? DateTime.UtcNow,
                    ColorsLoaded = false,
                    DetailsLoaded = false
                });
                
                var loadTime = DateTime.UtcNow - startTime;
                _logger.LogInformation("✅ Retrieved {Count} lazy designs in {LoadTime}ms", result.Count(), loadTime.TotalMilliseconds);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting lazy designs");
                throw;
            }
        }

        /// <summary>
        /// Load colors for lazy design
        /// </summary>
        public async Task<List<string>> LoadDesignColorsAsync(int designId)
        {
            try
            {
                _logger.LogInformation("🎨 Loading colors for design {DesignId}", designId);
                
                var colors = await _designRepository.GetDesignColorsAsync(designId);
                
                _logger.LogInformation("✅ Loaded {ColorCount} colors for design {DesignId}", colors.Count, designId);
                
                return colors;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error loading colors for design {DesignId}", designId);
                throw;
            }
        }

        /// <summary>
        /// Load full details for lazy design
        /// </summary>
        public async Task<DesignLazyDto> LoadDesignDetailsAsync(int designId)
        {
            try
            {
                _logger.LogInformation("📋 Loading full details for design {DesignId}", designId);
                
                var design = await _designRepository.GetDesignWithDetailsAsync(designId);
                if (design == null)
                {
                    throw new KeyNotFoundException($"Design with ID {designId} not found");
                }
                
                var colors = await _designRepository.GetDesignColorsAsync(designId);
                
                var result = new DesignLazyDto
                {
                    Id = design.Id,
                    ArticleF = design.ArticleF ?? string.Empty,
                    Client = design.Client ?? string.Empty,
                    Description = design.Description ?? string.Empty,
                    Status = design.Status ?? string.Empty,
                    ColorCount = design.ColorCount ?? 0,
                    LastModified = design.LastModified ?? DateTime.UtcNow,
                    ColorsLoaded = true,
                    Colors = colors,
                    DetailsLoaded = true,
                    Substrate = design.Substrate ?? string.Empty,
                    Type = design.Type ?? string.Empty,
                    PrintType = design.PrintType ?? string.Empty
                };
                
                _logger.LogInformation("✅ Loaded full details for design {DesignId}", designId);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error loading details for design {DesignId}", designId);
                throw;
            }
        }

        /// <summary>
        /// Get cache information (Mock implementation)
        /// </summary>
        public async Task<DesignCacheInfoDto> GetCacheInfoAsync()
        {
            try
            {
                var totalDesigns = await _designRepository.GetDesignStatsAsync();
                
                return new DesignCacheInfoDto
                {
                    CachedCount = totalDesigns.TotalDesigns,
                    LastCacheUpdate = DateTime.UtcNow.AddMinutes(-5), // Mock
                    CacheAge = TimeSpan.FromMinutes(5), // Mock
                    IsCacheValid = true,
                    CacheStatus = "Active"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error getting cache info");
                throw;
            }
        }

        /// <summary>
        /// Clear cache (Mock implementation)
        /// </summary>
        public async Task<bool> ClearCacheAsync()
        {
            try
            {
                _logger.LogInformation("🧹 Clearing design cache...");
                
                // Mock cache clearing
                await Task.Delay(100);
                
                _logger.LogInformation("✅ Design cache cleared");
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error clearing cache");
                throw;
            }
        }
    }
}

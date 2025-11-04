using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Services
{
    public interface IDesignService
    {
        Task<IEnumerable<DesignDto>> GetAllDesignsAsync();
        Task<DesignDto?> GetDesignByIdAsync(int id);
        Task<DesignDto?> GetDesignByArticleFAsync(string articleF);
        Task<DesignDto> CreateDesignAsync(CreateDesignDto createDto, int userId);
        Task<DesignDto> UpdateDesignAsync(int id, UpdateDesignDto updateDto, int userId);
        Task<bool> DeleteDesignAsync(int id);
        Task<DesignDto> DuplicateDesignAsync(int id, int userId);
        
        // Search and filtering
        Task<DesignListResponseDto> SearchDesignsAsync(DesignSearchDto searchDto);
        Task<DesignStatsDto> GetDesignStatsAsync();
        
        // Bulk operations
        Task<IEnumerable<DesignDto>> CreateMultipleDesignsAsync(BulkCreateDesignDto bulkDto, int userId);
        Task<bool> UpdateDesignStatusAsync(int id, string status, int userId);
        
        // Utility methods
        Task<DesignFiltersDto> GetDesignFiltersAsync();
        Task<IEnumerable<DesignDto>> GetRecentDesignsAsync(int count = 10);
        Task<bool> ValidateDesignAsync(CreateDesignDto design);
        Task<bool> ValidateDesignUpdateAsync(int id, UpdateDesignDto design);
        
        // Export methods
        Task<byte[]> ExportToExcelAsync();
        
        // Import methods
        Task<ImportResultDto> ImportFromExcelAsync(IFormFile file);
        
        // Data management
        Task<bool> ClearTestDataAsync();
        Task<int> ClearAllDesignsAsync();

        // ===== OPTIMIZED METHODS FOR FAST LOADING =====
        
        /// <summary>
        /// Get designs with pagination (OPTIMIZED)
        /// </summary>
        Task<PaginatedDesignsDto> GetDesignsPaginatedAsync(int page, int pageSize, string? search = null, string? sortBy = "LastModified", string? sortOrder = "desc");
        
        /// <summary>
        /// Get designs summary (ULTRA FAST - Only essential fields)
        /// </summary>
        Task<IEnumerable<DesignSummaryDto>> GetDesignsSummaryAsync();
        
        /// <summary>
        /// Get designs with lazy loading (Load details on demand)
        /// </summary>
        Task<IEnumerable<DesignLazyDto>> GetDesignsLazyAsync();
        
        /// <summary>
        /// Load colors for lazy design
        /// </summary>
        Task<List<string>> LoadDesignColorsAsync(int designId);
        
        /// <summary>
        /// Load full details for lazy design
        /// </summary>
        Task<DesignLazyDto> LoadDesignDetailsAsync(int designId);
        
        /// <summary>
        /// Get cache information
        /// </summary>
        Task<DesignCacheInfoDto> GetCacheInfoAsync();
        
        /// <summary>
        /// Clear cache
        /// </summary>
        Task<bool> ClearCacheAsync();
    }
}
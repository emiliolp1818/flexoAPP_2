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
    }
}
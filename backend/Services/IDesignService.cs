using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Services
{
    public interface IDesignService
    {
        Task<IEnumerable<DesignDto>> GetAllDesignsAsync();
        Task<IEnumerable<Models.Entities.Design>> GetAllDesignsRawAsync();
        Task<IEnumerable<DesignDto>> GetAllDesignsSafeAsync();
        Task<int> GetDesignsCountAsync();
        Task<DesignDto> CreateDesignAsync(Models.Entities.Design design, int userId);
        Task BulkInsertDesignsAsync(List<Models.Entities.Design> designs);
        Task<DesignDto?> GetDesignByIdAsync(int id);
        Task<DesignDto?> GetDesignByArticleFAsync(string articleF);
        Task<DesignDto> CreateDesignAsync(CreateDesignDto createDto, int userId);
        Task<DesignDto> UpdateDesignAsync(int id, UpdateDesignDto updateDto, int userId);
        Task<bool> DeleteDesignAsync(int id);
        Task<DesignDto> DuplicateDesignAsync(int id, int userId);


        Task<DesignListResponseDto> SearchDesignsAsync(DesignSearchDto searchDto);
        Task<DesignStatsDto> GetDesignStatsAsync();


        Task<IEnumerable<DesignDto>> CreateMultipleDesignsAsync(BulkCreateDesignDto bulkDto, int userId);
        Task<bool> UpdateDesignStatusAsync(int id, string status, int userId);


        Task<DesignFiltersDto> GetDesignFiltersAsync();
        Task<IEnumerable<DesignDto>> GetRecentDesignsAsync(int count = 10);
        Task<bool> ValidateDesignAsync(CreateDesignDto design);
        Task<bool> ValidateDesignUpdateAsync(int id, UpdateDesignDto design);


        Task<byte[]> ExportToExcelAsync();


        Task<ImportResultDto> ImportFromExcelAsync(IFormFile file);


        Task<bool> ClearTestDataAsync();
        Task<int> ClearAllDesignsAsync();






        Task<PaginatedDesignsDto> GetDesignsPaginatedAsync(int page, int pageSize, string? search = null, string? sortBy = "LastModified", string? sortOrder = "desc");




        Task<IEnumerable<DesignSummaryDto>> GetDesignsSummaryAsync();




        Task<IEnumerable<DesignLazyDto>> GetDesignsLazyAsync();




        Task<List<string>> LoadDesignColorsAsync(int designId);




        Task<DesignLazyDto> LoadDesignDetailsAsync(int designId);




        Task<DesignCacheInfoDto> GetCacheInfoAsync();




        Task<bool> ClearCacheAsync();




        Task<IEnumerable<string>> GetUniqueUsedColorsAsync();




        Task<List<string>> GetPantoneColorsByArticleAsync(string articleF);
    }
}
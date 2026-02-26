using FlexoAPP.API.Models.Entities;
using FlexoAPP.API.Models.DTOs;

namespace FlexoAPP.API.Repositories
{
    public interface IDesignRepository
    {
        Task<IEnumerable<Design>> GetAllDesignsAsync();
        Task<int> GetDesignsCountAsync();
        Task<Design?> GetDesignByIdAsync(int id);
        Task<Design?> GetDesignByArticleFAsync(string articleF);
        Task<Design> CreateDesignAsync(Design design);
        Task<Design> UpdateDesignAsync(Design design);
        Task<bool> DeleteDesignAsync(int id);
        Task<bool> DesignExistsAsync(int id);
        Task<bool> ArticleFExistsAsync(string articleF, int? excludeId = null);


        Task<(IEnumerable<Design> designs, int totalCount)> SearchDesignsAsync(DesignSearchDto searchDto);
        Task<DesignStatsDto> GetDesignStatsAsync();


        Task<IEnumerable<Design>> CreateMultipleDesignsAsync(IEnumerable<Design> designs);
        Task<bool> UpdateDesignStatusAsync(int id, string status, int modifiedBy);


        Task<IEnumerable<Design>> GetDesignsByClientAsync(string client);

        Task<IEnumerable<Design>> GetDesignsByTypeAsync(string type);
        Task<IEnumerable<Design>> GetRecentDesignsAsync(int count = 10);
        Task<IEnumerable<string>> GetUniqueClientsAsync();

        Task<IEnumerable<string>> GetUniqueSubstratesAsync();
        Task<IEnumerable<Design>> GetTestDesignsAsync();


        Task BulkInsertDesignsAsync(IEnumerable<Design> designs);
        Task<int> ClearAllDesignsAsync();






        Task<(IEnumerable<Design> designs, int totalCount)> GetDesignsPaginatedAsync(int page, int pageSize, string? search = null, string? sortBy = "LastModified", string? sortOrder = "desc");




        Task<IEnumerable<Design>> GetDesignsSummaryAsync();




        Task<IEnumerable<Design>> GetDesignsLazyAsync();




        Task<List<string>> GetDesignColorsAsync(int designId);




        Task<Design?> GetDesignWithDetailsAsync(int designId);




        Task<IEnumerable<string>> GetUniqueUsedColorsAsync();




        Task<List<string>> GetPantoneColorsByArticleAsync(string articleF);
    }
}
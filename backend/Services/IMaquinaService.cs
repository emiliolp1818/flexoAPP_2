using flexoAPP.Models.DTOs;
using Microsoft.AspNetCore.Http;

namespace flexoAPP.Services
{
    public interface IMaquinaService
    {
        Task<IEnumerable<MaquinaDto>> GetAllAsync();
        Task<MaquinaDto?> GetByArticuloAsync(string articulo);
        Task<IEnumerable<MaquinaDto>> GetByNumeroMaquinaAsync(int numeroMaquina);
        Task<MaquinaDto> CreateAsync(CreateMaquinaDto createDto, int? userId);
        Task<MaquinaDto> UpdateAsync(string otSap, UpdateMaquinaDto updateDto, int? userId);
        Task<MaquinaDto> UpdateMachineStatusAsync(string otSap, string estado, string? observaciones, int? userId, string? userName);
        Task<bool> DeleteAsync(string otSap);
        Task<ExcelProcessResultDto> ProcessExcelFileAsync(IFormFile file, int? userId);
        Task<int> ClearAllProgrammingAsync(int? userId);
        Task<object> FixDatabaseSchemaAsync();
    }
}

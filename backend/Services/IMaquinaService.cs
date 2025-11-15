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
        Task<MaquinaDto> UpdateAsync(string articulo, UpdateMaquinaDto updateDto, int? userId);
        Task<bool> DeleteAsync(string articulo);
        Task<ExcelProcessResultDto> ProcessExcelFileAsync(IFormFile file, int? userId);
        Task<int> ClearAllProgrammingAsync(int? userId);
    }
}

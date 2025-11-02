using flexoAPP.Models.DTOs;
using Microsoft.AspNetCore.Http;

namespace flexoAPP.Services
{
    public interface IMachineProgramService
    {
        Task<IEnumerable<MachineProgramDto>> GetAllAsync();
        Task<MachineProgramDto?> GetByIdAsync(int id);
        Task<IEnumerable<MachineProgramDto>> GetByMachineNumberAsync(int machineNumber);
        Task<IEnumerable<MachineProgramDto>> GetByStatusAsync(string status);
        Task<MachineProgramDto> CreateAsync(CreateMachineProgramDto createDto, int? userId);
        Task<MachineProgramDto> UpdateAsync(int id, UpdateMachineProgramDto updateDto, int? userId);
        Task<MachineProgramDto> ChangeStatusAsync(int id, ChangeStatusDto changeStatusDto, int? userId);
        Task<bool> DeleteAsync(int id);
        Task<MachineProgramStatisticsDto> GetStatisticsAsync();
        Task<IEnumerable<MachineProgramDto>> GetActiveProgramsAsync();
        Task<IEnumerable<int>> GetActiveMachineNumbersAsync();
        Task<bool> ValidateOtSapAsync(string otSap, int? excludeId = null);
        Task<int> GetTotalCountAsync();
        
        // Nuevos métodos para carga de Excel
        Task<ExcelProcessResultDto> ProcessExcelFileAsync(IFormFile file, int? userId);
        Task<int> ClearAllProgrammingAsync(int? userId);
    }

    public class ExcelProcessResultDto
    {
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public List<string>? ValidationErrors { get; set; }
        public int ProcessedCount { get; set; }
        public List<MachineProgramDto>? Programs { get; set; }
    }
}
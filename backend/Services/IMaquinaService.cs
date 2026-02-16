using flexoAPP.Models.DTOs;
using Microsoft.AspNetCore.Http;

namespace flexoAPP.Services
{
    public interface IMaquinaService
    {
        Task<MaquinaDto> UpdateMachineStatusAsync(string otSap, string estado, string? observaciones, int? userId, string? userName);
        Task<object> FixDatabaseSchemaAsync();
        Task<object> UpdateKilosDecimalPrecisionAsync();
    }
}

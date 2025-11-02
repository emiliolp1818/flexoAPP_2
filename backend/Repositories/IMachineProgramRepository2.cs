using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;

namespace FlexoAPP.API.Repositories
{
    public interface IMachineProgramRepository
    {
        Task<IEnumerable<MachineProgram>> GetAllAsync();
        Task<MachineProgram?> GetByIdAsync(int id);
        Task<IEnumerable<MachineProgram>> GetByMachineNumberAsync(int machineNumber);
        Task<IEnumerable<MachineProgram>> GetByStatusAsync(string status);
        Task<MachineProgram?> GetByArticuloAndOtSapAsync(string articulo, string otSap);
        Task<MachineProgram> CreateAsync(MachineProgram program);
        Task<MachineProgram> UpdateAsync(MachineProgram program);
        Task<bool> DeleteAsync(int id);
        Task<MachineProgramStatisticsDto> GetStatisticsAsync();
    }
}
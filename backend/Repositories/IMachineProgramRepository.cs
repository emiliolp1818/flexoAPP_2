using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;

namespace flexoAPP.Repositories
{
    public interface IMachineProgramRepository
    {
        Task<IEnumerable<MachineProgram>> GetAllAsync();
        Task<MachineProgram?> GetByIdAsync(int id);
        Task<IEnumerable<MachineProgram>> GetByMachineNumberAsync(int machineNumber);
        Task<IEnumerable<MachineProgram>> GetByStatusAsync(string status);
        Task<MachineProgram> CreateAsync(MachineProgram program);
        Task<MachineProgram> UpdateAsync(MachineProgram program);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsByOtSapAsync(string otSap, int? excludeId = null);
        Task<MachineProgramStatisticsDto> GetStatisticsAsync();
        Task<IEnumerable<MachineProgram>> GetActiveProgramsAsync();
        Task<IEnumerable<int>> GetActiveMachineNumbersAsync();
    }
}
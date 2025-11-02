using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;

namespace FlexoAPP.API.Services
{
    public interface IMachineProgramService
    {
        Task<IEnumerable<MachineProgram>> GetAllProgramsAsync();
        Task<MachineProgram?> GetProgramByIdAsync(int id);
        Task<IEnumerable<MachineProgram>> GetProgramsByMachineAsync(int machineNumber);
        Task<IEnumerable<MachineProgram>> GetProgramsByStatusAsync(string status);
        Task<MachineProgram?> GetProgramByArticuloAndOtSapAsync(string articulo, string otSap);
        Task<MachineProgram> CreateProgramAsync(MachineProgram program);
        Task<MachineProgram> UpdateProgramAsync(MachineProgram program);
        Task<bool> DeleteProgramAsync(int id);
        Task<MachineProgramStatisticsDto> GetStatisticsAsync();
    }
}
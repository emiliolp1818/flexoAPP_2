using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Services
{
    public interface IMachineBackupService
    {



        Task<MachineBackupResultDto> CreateBackupAsync(MachineBackupRequestDto request);




        Task<List<MachineBackupInfoDto>> GetBackupsListAsync();




        Task<bool> RestoreBackupAsync(string backupId);




        Task<bool> DeleteBackupAsync(string backupId);




        Task<List<Maquina>> GetBackupDataForReportsAsync(string backupId);




        Task<MachineBackupResultDto> CreateDailyBackupAsync();




        Task<bool> VerifyBackupIntegrityAsync(string backupId);




        Task<byte[]> ExportBackupToFileAsync(string backupId, string format = "json");




        Task<MachineBackupResultDto> ImportBackupFromFileAsync(byte[] fileData, string fileName);




        Task<MachineBackupStatsDto> GetBackupStatsAsync(string backupId);
    }
}
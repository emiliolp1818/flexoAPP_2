using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Services
{
    public interface IMachineBackupService
    {
        /// <summary>
        /// Crear backup completo de datos de máquinas
        /// </summary>
        Task<MachineBackupResultDto> CreateBackupAsync(MachineBackupRequestDto request);

        /// <summary>
        /// Obtener lista de backups disponibles
        /// </summary>
        Task<List<MachineBackupInfoDto>> GetBackupsListAsync();

        /// <summary>
        /// Restaurar backup de máquinas
        /// </summary>
        Task<bool> RestoreBackupAsync(string backupId);

        /// <summary>
        /// Eliminar backup específico
        /// </summary>
        Task<bool> DeleteBackupAsync(string backupId);

        /// <summary>
        /// Obtener datos de backup para reportes
        /// </summary>
        Task<List<MachineProgram>> GetBackupDataForReportsAsync(string backupId);

        /// <summary>
        /// Crear backup automático diario
        /// </summary>
        Task<MachineBackupResultDto> CreateDailyBackupAsync();

        /// <summary>
        /// Verificar integridad de backup
        /// </summary>
        Task<bool> VerifyBackupIntegrityAsync(string backupId);

        /// <summary>
        /// Exportar backup a archivo
        /// </summary>
        Task<byte[]> ExportBackupToFileAsync(string backupId, string format = "json");

        /// <summary>
        /// Importar backup desde archivo
        /// </summary>
        Task<MachineBackupResultDto> ImportBackupFromFileAsync(byte[] fileData, string fileName);

        /// <summary>
        /// Obtener estadísticas de backup
        /// </summary>
        Task<MachineBackupStatsDto> GetBackupStatsAsync(string backupId);
    }
}
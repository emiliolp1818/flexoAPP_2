using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Services
{
    public interface IReportsService
    {
        // ============================================================================
        // REPORTES DE PRODUCCIÓN (EXISTENTES)
        // ============================================================================
        Task<ReportSummaryDto> GetReportSummaryAsync(ReportFilterDto filter);
        Task<List<ProductionReportDto>> GetProductionReportAsync(ReportFilterDto filter);
        Task<List<MachineEfficiencyReportDto>> GetMachineEfficiencyReportAsync(ReportFilterDto filter);
        Task<List<ClientReportDto>> GetClientReportAsync(ReportFilterDto filter);
        Task<List<DailyProductionReportDto>> GetDailyProductionReportAsync(ReportFilterDto filter);
        Task<List<string>> GetClientsListAsync();
        Task<List<string>> GetArticulosListAsync();
        Task<byte[]> ExportToExcelAsync(string reportType, ReportFilterDto filter);
        Task<byte[]> ExportToPDFAsync(string reportType, ReportFilterDto filter);

        // ============================================================================
        // REPORTES DE ACTIVIDADES DE USUARIO (EXISTENTES)
        // ============================================================================
        Task<List<UserActivityDto>> GetUserActivitiesAsync(UserActivityFilterDto filter);
        Task<MachineActivityReportDto> GetMachineActivitiesByUserAsync(MachineActivityFilterDto filter);
        Task<MachineActivityReportDto> GetMachineActivitiesFromBackupAsync(string backupId);
        Task<List<UserDto>> GetUsersListAsync();

        // ============================================================================
        // TESTS (EXISTENTES)
        // ============================================================================
        Task<List<object>> GetRecentActivitiesTestAsync();
        Task<object> GetActivitiesStatsTestAsync();
        
        // ============================================================================
        // NUEVOS MÉTODOS OPTIMIZADOS PARA AUDITORÍA
        // ============================================================================
        
        /// <summary>
        /// Obtiene actividades de auditoría con paginación y filtros optimizados
        /// </summary>
        Task<PagedResultDto<AuditActivityDto>> GetAuditActivitiesPagedAsync(AuditActivityFilterDto filter);
        
        /// <summary>
        /// Obtiene estadísticas por módulo (para mostrar contadores sin cargar todos los datos)
        /// </summary>
        Task<List<ModuleStatsDto>> GetModuleStatsAsync(AuditActivityFilterDto filter);
        
        /// <summary>
        /// Obtiene lista de usuarios que tienen actividades (para el filtro)
        /// </summary>
        Task<List<UserBasicDto>> GetActiveUsersListAsync();
    }
}

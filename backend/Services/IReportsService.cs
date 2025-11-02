using FlexoAPP.API.Models.DTOs;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Services
{
    public interface IReportsService
    {
        Task<ReportSummaryDto> GetReportSummaryAsync(ReportFilterDto filter);
        Task<List<ProductionReportDto>> GetProductionReportAsync(ReportFilterDto filter);
        Task<List<MachineEfficiencyReportDto>> GetMachineEfficiencyReportAsync(ReportFilterDto filter);
        Task<List<ClientReportDto>> GetClientReportAsync(ReportFilterDto filter);
        Task<List<DailyProductionReportDto>> GetDailyProductionReportAsync(ReportFilterDto filter);
        Task<List<string>> GetClientsListAsync();
        Task<List<string>> GetArticulosListAsync();
        Task<byte[]> ExportToExcelAsync(string reportType, ReportFilterDto filter);
        Task<byte[]> ExportToPDFAsync(string reportType, ReportFilterDto filter);
        
        // Nuevos métodos para actividades de usuario
        Task<List<UserActivityDto>> GetUserActivitiesAsync(UserActivityFilterDto filter);
        Task<MachineActivityReportDto> GetMachineActivitiesByUserAsync(MachineActivityFilterDto filter);
        Task<MachineActivityReportDto> GetMachineActivitiesFromBackupAsync(string backupId);
        Task<List<UserDto>> GetUsersListAsync();
    }
}
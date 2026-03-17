namespace FlexoAPP.API.Models.DTOs
{
    // ============================================================================
    // FILTROS OPTIMIZADOS CON PAGINACIÓN
    // ============================================================================
    
    public class ReportFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int>? MachineNumbers { get; set; }
        public List<string>? Status { get; set; }
        public string? Cliente { get; set; }
        public string? Articulo { get; set; }
        
        // Paginación
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        
        // Ordenamiento
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = true;
    }

    // ============================================================================
    // RESPUESTAS PAGINADAS
    // ============================================================================
    
    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }

    // ============================================================================
    // DTOs EXISTENTES (OPTIMIZADOS)
    // ============================================================================
    
    public class ReportSummaryDto
    {
        public int TotalPrograms { get; set; }
        public int CompletedPrograms { get; set; }
        public int RunningPrograms { get; set; }
        public int SuspendedPrograms { get; set; }
        public int ReadyPrograms { get; set; }
        public decimal TotalKilos { get; set; }
        public double AverageEfficiency { get; set; }
        public int ActiveMachines { get; set; }
        public int TotalMachines { get; set; }
    }

    public class ProductionReportDto
    {
        public int MachineNumber { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string Articulo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public decimal Kilos { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public int Progreso { get; set; }
        public double? TiempoTotal { get; set; }
        public double? Eficiencia { get; set; }
        public string? OperatorName { get; set; }
    }

    public class MachineEfficiencyReportDto
    {
        public int MachineNumber { get; set; }
        public int TotalPrograms { get; set; }
        public int CompletedPrograms { get; set; }
        public decimal TotalKilos { get; set; }
        public double AverageEfficiency { get; set; }
        public double TotalHours { get; set; }
        public double Downtime { get; set; }
        public double UtilizationRate { get; set; }
    }

    public class ClientReportDto
    {
        public string Cliente { get; set; } = string.Empty;
        public int TotalPrograms { get; set; }
        public decimal TotalKilos { get; set; }
        public int CompletedPrograms { get; set; }
        public int PendingPrograms { get; set; }
        public double AverageCompletionTime { get; set; }
    }

    public class DailyProductionReportDto
    {
        public DateTime Date { get; set; }
        public int TotalPrograms { get; set; }
        public int CompletedPrograms { get; set; }
        public decimal TotalKilos { get; set; }
        public int ActiveMachines { get; set; }
        public double Efficiency { get; set; }
    }
    
    // ============================================================================
    // NUEVOS DTOs PARA AUDITORÍA OPTIMIZADA
    // ============================================================================
    
    public class AuditActivityFilterDto
    {
        public int? UserId { get; set; }
        public string? Module { get; set; }
        public string? Action { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        
        // Paginación
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 30;
        
        // Ordenamiento
        public string SortBy { get; set; } = "Timestamp";
        public bool SortDescending { get; set; } = true;
    }
    
    public class AuditActivityDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Module { get; set; } = string.Empty;
        public string? Details { get; set; }
        public int UserId { get; set; }
        public string UserCode { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public string? EntityType { get; set; }
        public int? EntityId { get; set; }
        public string? EntityName { get; set; }
        public double? Duration { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        
        // Usuario relacionado
        public UserBasicDto? User { get; set; }
    }
    
    public class ModuleStatsDto
    {
        public string Module { get; set; } = string.Empty;
        public string ModuleLabel { get; set; } = string.Empty;
        public int TotalActivities { get; set; }
        public DateTime? LastActivity { get; set; }
        public int UniqueUsers { get; set; }
    }
}

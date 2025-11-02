namespace FlexoAPP.API.Models.DTOs
{
    public class ReportFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int>? MachineNumbers { get; set; }
        public List<string>? Status { get; set; }
        public string? Cliente { get; set; }
        public string? Articulo { get; set; }
    }

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
        public int Id { get; set; }
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
}
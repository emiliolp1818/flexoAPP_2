using System.ComponentModel.DataAnnotations;

namespace FlexoAPP.API.Models.DTOs
{
    /// <summary>
    /// DTO para solicitar la creación de un backup de máquinas
    /// </summary>
    public class MachineBackupRequestDto
    {
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int>? MachineNumbers { get; set; }
        public List<string>? Status { get; set; }
        public bool IncludeAllMachines { get; set; } = true;
        public bool CompressData { get; set; } = true;
        public bool CreateCompressedBackup { get; set; } = true;
        public int RetentionDays { get; set; } = 30;
    }

    /// <summary>
    /// DTO para el resultado de la operación de backup
    /// </summary>
    public class MachineBackupResultDto
    {
        public bool Success { get; set; }
        public string? BackupId { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalRecords { get; set; }
        public long BackupSize { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO para información básica de un backup
    /// </summary>
    public class MachineBackupInfoDto
    {
        public string BackupId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TotalRecords { get; set; }
        public long BackupSize { get; set; }
        public int MachineCount { get; set; }
        public BackupDateRangeDto? DateRange { get; set; }
        public Dictionary<string, int>? StatusBreakdown { get; set; }
        public bool IsValid { get; set; } = true;
    }

    /// <summary>
    /// DTO para los datos completos de un backup
    /// </summary>
    public class MachineBackupDataDto
    {
        public string BackupId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<MachineProgramBackupDto> MachinePrograms { get; set; } = new();
        public int TotalRecords { get; set; }
        public long BackupSize { get; set; }
    }

    /// <summary>
    /// DTO para metadatos del backup
    /// </summary>
    public class MachineBackupMetadataDto
    {
        public string BackupId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Description { get; set; } = string.Empty;
        public int TotalRecords { get; set; }
        public long BackupSize { get; set; }
        public List<int> MachineNumbers { get; set; } = new();
        public BackupDateRangeDto? DateRange { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new();
        public string BackupVersion { get; set; } = "1.0";
        public string ApplicationVersion { get; set; } = "FlexoAPP 1.0";
    }

    /// <summary>
    /// DTO para programa de máquina en backup
    /// </summary>
    public class MachineProgramBackupDto
    {
        public int Id { get; set; }
        public int MachineNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Articulo { get; set; } = string.Empty;
        public string OtSap { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string? Referencia { get; set; }
        public string? Td { get; set; }
        public string Colores { get; set; } = string.Empty;
        public string? Sustrato { get; set; }
        public decimal Kilos { get; set; }
        public string Estado { get; set; } = "LISTO";
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public int Progreso { get; set; } = 0;
        public string? Observaciones { get; set; }
        public string? LastActionBy { get; set; }
        public DateTime? LastActionAt { get; set; }
        public string? LastAction { get; set; }
        public string? OperatorName { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO para rango de fechas del backup
    /// </summary>
    public class BackupDateRangeDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    /// <summary>
    /// DTO para estadísticas del backup
    /// </summary>
    public class MachineBackupStatsDto
    {
        public string BackupId { get; set; } = string.Empty;
        public int TotalPrograms { get; set; }
        public int MachineCount { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new();
        public Dictionary<string, int> ClientBreakdown { get; set; } = new();
        public decimal TotalKilos { get; set; }
        public BackupDateRangeDto? DateRange { get; set; }
    }

    /// <summary>
    /// DTO para restaurar backup
    /// </summary>
    public class RestoreBackupRequestDto
    {
        [Required]
        public string BackupId { get; set; } = string.Empty;
        public bool OverwriteExisting { get; set; } = false;
        public bool CreateBackupBeforeRestore { get; set; } = true;
    }

    /// <summary>
    /// DTO para resultado de restauración
    /// </summary>
    public class RestoreBackupResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int RestoredRecords { get; set; }
        public string? PreRestoreBackupId { get; set; }
        public DateTime RestoredAt { get; set; }
    }
}
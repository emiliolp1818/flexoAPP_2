namespace FlexoAPP.API.Models.DTOs
{
    public class UserActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserCode { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string Component { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int DaysRemaining { get; set; }
        public bool IsExpiringSoon { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }

    public class MachineActivityReportDto
    {
        public UserDto User { get; set; } = new();
        public DateTime ReportDate { get; set; }
        public int CompletedOrders { get; set; }
        public int SuspendedOrders { get; set; }
        public int TotalMovements { get; set; }
        public int ActiveHours { get; set; }
        public List<MachineOrderDto> CompletedOrdersList { get; set; } = new();
        public List<MachineOrderDto> SuspendedOrdersList { get; set; } = new();
        public List<UserMovementDto> UserMovements { get; set; } = new();
        public string? BackupId { get; set; }
        public bool IsFromBackup { get; set; }
    }

    public class MachineOrderDto
    {
        public string OrderNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MachineId { get; set; } = string.Empty;
        public DateTime? CompletedTime { get; set; }
        public DateTime? SuspendedTime { get; set; }
        public int? Duration { get; set; }
        public int? ElapsedTime { get; set; }
        public int Quantity { get; set; }
        public int? Progress { get; set; }
        public string? SuspensionReason { get; set; }
    }

    public class UserMovementDto
    {
        public string Id { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? MachineId { get; set; }
        public string? OrderNumber { get; set; }
        public string Module { get; set; } = string.Empty;
    }
}
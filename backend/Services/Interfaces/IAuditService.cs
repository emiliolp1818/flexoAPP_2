namespace FlexoAPP.API.Services
{
    public interface IAuditService
    {
        Task LogAsync(int? userId, string action, string entityType, int entityId, object? oldValues, object? newValues = null);
        Task LogActionAsync(string entityType, int entityId, string action, string? details = null, int? userId = null);
        Task LogProgramStatusChangeAsync(int programId, string oldStatus, string newStatus, int? userId = null, string? observaciones = null);
        Task LogProgramCreateAsync(int programId, int? userId = null);
        Task LogProgramUpdateAsync(int programId, int? userId = null, string? changes = null);
        Task LogProgramDeleteAsync(int programId, int? userId = null);
    }
}
using Microsoft.Extensions.Logging;

namespace FlexoAPP.API.Services
{
    public class AuditService : IAuditService
    {
        private readonly ILogger<AuditService> _logger;

        public AuditService(ILogger<AuditService> logger)
        {
            _logger = logger;
        }

        public async Task LogAsync(int? userId, string action, string entityType, int entityId, object? oldValues, object? newValues = null)
        {
            _logger.LogInformation("Audit Log: User {UserId} performed {Action} on {EntityType} {EntityId}", 
                userId, action, entityType, entityId);
            await Task.CompletedTask;
        }

        public async Task LogActionAsync(string entityType, int entityId, string action, string? details = null, int? userId = null)
        {
            _logger.LogInformation("Audit Action: {Action} on {EntityType} {EntityId} by User {UserId}. Details: {Details}", 
                action, entityType, entityId, userId, details);
            await Task.CompletedTask;
        }

        public async Task LogProgramStatusChangeAsync(int programId, string oldStatus, string newStatus, int? userId = null, string? observaciones = null)
        {
            _logger.LogInformation("Program Status Change: Program {ProgramId} changed from {OldStatus} to {NewStatus} by User {UserId}. Notes: {Observaciones}", 
                programId, oldStatus, newStatus, userId, observaciones);
            await Task.CompletedTask;
        }

        public async Task LogProgramCreateAsync(int programId, int? userId = null)
        {
            _logger.LogInformation("Program Created: Program {ProgramId} created by User {UserId}", 
                programId, userId);
            await Task.CompletedTask;
        }

        public async Task LogProgramUpdateAsync(int programId, int? userId = null, string? changes = null)
        {
            _logger.LogInformation("Program Updated: Program {ProgramId} updated by User {UserId}. Changes: {Changes}", 
                programId, userId, changes);
            await Task.CompletedTask;
        }

        public async Task LogProgramDeleteAsync(int programId, int? userId = null)
        {
            _logger.LogInformation("Program Deleted: Program {ProgramId} deleted by User {UserId}", 
                programId, userId);
            await Task.CompletedTask;
        }
    }
}
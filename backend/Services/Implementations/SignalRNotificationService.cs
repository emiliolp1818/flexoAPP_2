using Microsoft.AspNetCore.SignalR;
using FlexoAPP.API.Hubs;

namespace FlexoAPP.API.Services
{
    /// <summary>
    /// Implementación del servicio de notificaciones SignalR
    /// </summary>
    public class SignalRNotificationService : ISignalRNotificationService
    {
        private readonly IHubContext<MaquinasHub> _hubContext;
        private readonly ILogger<SignalRNotificationService> _logger;

        public SignalRNotificationService(
            IHubContext<MaquinasHub> hubContext,
            ILogger<SignalRNotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task NotifyMachineUpdated(string otSap, int machineNumber, string action, string? userName = null)
        {
            try
            {
                var notification = new
                {
                    type = "MachineUpdated",
                    otSap,
                    machineNumber,
                    action,
                    userName,
                    timestamp = DateTime.UtcNow
                };

                // Notificar a todos los clientes
                await _hubContext.Clients.All.SendAsync("MachineUpdated", notification);
                
                // Notificar al grupo específico de la máquina
                await _hubContext.Clients.Group($"Machine_{machineNumber}")
                    .SendAsync("MachineUpdated", notification);

                _logger.LogDebug($"📢 Notificación enviada: Máquina {machineNumber} - OT {otSap} - Acción: {action}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error enviando notificación de actualización de máquina {otSap}");
            }
        }

        public async Task NotifyMachineStateChanged(string otSap, int machineNumber, string? oldState, string? newState, string? userName = null)
        {
            try
            {
                var notification = new
                {
                    type = "MachineStateChanged",
                    otSap,
                    machineNumber,
                    oldState,
                    newState,
                    userName,
                    timestamp = DateTime.UtcNow
                };

                await _hubContext.Clients.All.SendAsync("MachineStateChanged", notification);
                await _hubContext.Clients.Group($"Machine_{machineNumber}")
                    .SendAsync("MachineStateChanged", notification);

                _logger.LogInformation($"📢 Cambio de estado: Máquina {machineNumber} - OT {otSap}: {oldState} → {newState}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error enviando notificación de cambio de estado {otSap}");
            }
        }

        public async Task NotifyExcelImported(int machineNumber, int created, int updated, string? userName = null)
        {
            try
            {
                var notification = new
                {
                    type = "ExcelImported",
                    machineNumber,
                    created,
                    updated,
                    userName,
                    timestamp = DateTime.UtcNow
                };

                await _hubContext.Clients.All.SendAsync("ExcelImported", notification);
                await _hubContext.Clients.Group($"Machine_{machineNumber}")
                    .SendAsync("ExcelImported", notification);

                _logger.LogInformation($"📢 Excel importado: Máquina {machineNumber} - Creados: {created}, Actualizados: {updated}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error enviando notificación de importación Excel");
            }
        }

        public async Task NotifyMachineDeleted(string otSap, int machineNumber, string? userName = null)
        {
            try
            {
                var notification = new
                {
                    type = "MachineDeleted",
                    otSap,
                    machineNumber,
                    userName,
                    timestamp = DateTime.UtcNow
                };

                await _hubContext.Clients.All.SendAsync("MachineDeleted", notification);
                await _hubContext.Clients.Group($"Machine_{machineNumber}")
                    .SendAsync("MachineDeleted", notification);

                _logger.LogInformation($"📢 Máquina eliminada: {machineNumber} - OT {otSap}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error enviando notificación de eliminación {otSap}");
            }
        }

        public async Task NotifyRefreshAll(string reason)
        {
            try
            {
                var notification = new
                {
                    type = "RefreshAll",
                    reason,
                    timestamp = DateTime.UtcNow
                };

                await _hubContext.Clients.All.SendAsync("RefreshAll", notification);

                _logger.LogInformation($"📢 Refresh global solicitado: {reason}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error enviando notificación de refresh global");
            }
        }

        /// <summary>
        /// Enviar notificación genérica de actualización de máquina con objeto personalizado
        /// </summary>
        public async Task NotifyMachineUpdatedAsync(object notification)
        {
            try
            {
                // Notificar a todos los clientes
                await _hubContext.Clients.All.SendAsync("MachineUpdated", notification);

                _logger.LogInformation($"📢 Notificación MachineUpdated enviada a todos los clientes");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error enviando notificación MachineUpdated");
            }
        }
    }
}

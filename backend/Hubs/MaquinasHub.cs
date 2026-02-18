using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace FlexoAPP.API.Hubs
{
    /// <summary>
    /// Hub de SignalR para sincronización en tiempo real de máquinas
    /// </summary>
    [Authorize]
    public class MaquinasHub : Hub
    {
        private readonly ILogger<MaquinasHub> _logger;

        public MaquinasHub(ILogger<MaquinasHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Evento cuando un cliente se conecta
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userName = Context.User?.Identity?.Name ?? "Anónimo";
            _logger.LogInformation($"🔌 Cliente conectado: {userName} (ConnectionId: {Context.ConnectionId})");
            
            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Evento cuando un cliente se desconecta
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userName = Context.User?.Identity?.Name ?? "Anónimo";
            
            if (exception != null)
            {
                _logger.LogWarning($"⚠️ Cliente desconectado con error: {userName} - {exception.Message}");
            }
            else
            {
                _logger.LogInformation($"👋 Cliente desconectado: {userName}");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Unirse a un grupo de máquina específica
        /// </summary>
        public async Task JoinMachineGroup(int machineNumber)
        {
            var groupName = $"Machine_{machineNumber}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _logger.LogDebug($"👥 Cliente {Context.ConnectionId} se unió al grupo {groupName}");
        }

        /// <summary>
        /// Salir de un grupo de máquina específica
        /// </summary>
        public async Task LeaveMachineGroup(int machineNumber)
        {
            var groupName = $"Machine_{machineNumber}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            _logger.LogDebug($"👋 Cliente {Context.ConnectionId} salió del grupo {groupName}");
        }
    }
}

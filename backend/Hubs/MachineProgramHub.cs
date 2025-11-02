using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using flexoAPP.Models.DTOs;
using flexoAPP.Services;
using System.Security.Claims;

namespace flexoAPP.Hubs
{
    [Authorize]
    public class MachineProgramHub : Hub
    {
        private readonly IMachineProgramService _machineProgramService;
        private readonly ILogger<MachineProgramHub> _logger;

        public MachineProgramHub(
            IMachineProgramService machineProgramService,
            ILogger<MachineProgramHub> logger)
        {
            _machineProgramService = machineProgramService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            _logger.LogInformation($"Usuario {userName} (ID: {userId}) conectado al hub de sincronización. ConnectionId: {Context.ConnectionId}");
            
            // Unir a grupo general de sincronización
            await Groups.AddToGroupAsync(Context.ConnectionId, "MachineProgramSync");
            
            // Enviar estado inicial de conexión
            await Clients.Caller.SendAsync("ConnectionEstablished", new
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId,
                UserName = userName,
                ConnectedAt = DateTime.UtcNow
            });

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            _logger.LogInformation($"Usuario {userName} (ID: {userId}) desconectado del hub. ConnectionId: {Context.ConnectionId}");
            
            if (exception != null)
            {
                _logger.LogError(exception, $"Error en desconexión del usuario {userName}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Método para unirse a un grupo específico de máquina
        public async Task JoinMachineGroup(int machineNumber)
        {
            var groupName = $"Machine_{machineNumber}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            
            _logger.LogInformation($"Usuario {Context.ConnectionId} se unió al grupo de máquina {machineNumber}");
            
            await Clients.Caller.SendAsync("JoinedMachineGroup", new
            {
                MachineNumber = machineNumber,
                GroupName = groupName
            });
        }

        // Método para salir de un grupo específico de máquina
        public async Task LeaveMachineGroup(int machineNumber)
        {
            var groupName = $"Machine_{machineNumber}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            
            _logger.LogInformation($"Usuario {Context.ConnectionId} salió del grupo de máquina {machineNumber}");
        }

        // Método para crear programa (emitido desde cliente)
        public async Task CreateProgram(CreateMachineProgramDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var createdProgram = await _machineProgramService.CreateAsync(createDto, userId);
                
                // Notificar a todos los clientes conectados
                await Clients.Group("MachineProgramSync").SendAsync("program:created", createdProgram);
                
                // Notificar específicamente al grupo de la máquina
                await Clients.Group($"Machine_{createDto.MachineNumber}").SendAsync("program:created", createdProgram);
                
                _logger.LogInformation($"Programa creado y sincronizado: {createdProgram.Articulo} en máquina {createDto.MachineNumber}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando programa desde hub");
                await Clients.Caller.SendAsync("Error", new { Message = ex.Message, Type = "CreateProgram" });
            }
        }

        // Método para actualizar programa
        public async Task UpdateProgram(int programId, UpdateMachineProgramDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var updatedProgram = await _machineProgramService.UpdateAsync(programId, updateDto, userId);
                
                // Notificar a todos los clientes conectados
                await Clients.Group("MachineProgramSync").SendAsync("program:updated", updatedProgram);
                
                // Notificar específicamente al grupo de la máquina
                await Clients.Group($"Machine_{updatedProgram.MachineNumber}").SendAsync("program:updated", updatedProgram);
                
                _logger.LogInformation($"Programa actualizado y sincronizado: {updatedProgram.Articulo}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando programa desde hub");
                await Clients.Caller.SendAsync("Error", new { Message = ex.Message, Type = "UpdateProgram" });
            }
        }

        // Método para cambiar estado
        public async Task ChangeStatus(int programId, string status, int machineNumber, string? observaciones = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var changeStatusDto = new ChangeStatusDto 
                { 
                    Estado = status, 
                    Observaciones = observaciones 
                };
                
                var updatedProgram = await _machineProgramService.ChangeStatusAsync(programId, changeStatusDto, userId);
                
                // Datos del evento de cambio de estado
                var statusChangeEvent = new
                {
                    ProgramId = programId,
                    Status = status,
                    MachineNumber = machineNumber,
                    Observaciones = observaciones,
                    UpdatedProgram = updatedProgram,
                    ChangedBy = userId,
                    ChangedAt = DateTime.UtcNow
                };

                // Notificar a todos los clientes conectados
                await Clients.Group("MachineProgramSync").SendAsync("status:changed", statusChangeEvent);
                
                // Notificar específicamente al grupo de la máquina
                await Clients.Group($"Machine_{machineNumber}").SendAsync("status:changed", statusChangeEvent);
                
                _logger.LogInformation($"Estado cambiado y sincronizado: Programa {programId} a {status} en máquina {machineNumber}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cambiando estado desde hub");
                await Clients.Caller.SendAsync("Error", new { Message = ex.Message, Type = "ChangeStatus" });
            }
        }

        // Método para eliminar programa
        public async Task DeleteProgram(int programId, int machineNumber)
        {
            try
            {
                var success = await _machineProgramService.DeleteAsync(programId);
                
                if (success)
                {
                    var deleteEvent = new
                    {
                        ProgramId = programId,
                        MachineNumber = machineNumber,
                        DeletedAt = DateTime.UtcNow
                    };

                    // Notificar a todos los clientes conectados
                    await Clients.Group("MachineProgramSync").SendAsync("program:deleted", deleteEvent);
                    
                    // Notificar específicamente al grupo de la máquina
                    await Clients.Group($"Machine_{machineNumber}").SendAsync("program:deleted", deleteEvent);
                    
                    _logger.LogInformation($"Programa eliminado y sincronizado: {programId} de máquina {machineNumber}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando programa desde hub");
                await Clients.Caller.SendAsync("Error", new { Message = ex.Message, Type = "DeleteProgram" });
            }
        }

        // Método para solicitar sincronización completa
        public async Task RequestFullSync()
        {
            try
            {
                var allPrograms = await _machineProgramService.GetAllAsync();
                var statistics = await _machineProgramService.GetStatisticsAsync();
                
                var syncData = new
                {
                    Programs = allPrograms,
                    Statistics = statistics,
                    SyncTimestamp = DateTime.UtcNow
                };

                await Clients.Caller.SendAsync("sync:complete", syncData);
                
                _logger.LogInformation($"Sincronización completa enviada a {Context.ConnectionId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en sincronización completa");
                await Clients.Caller.SendAsync("Error", new { Message = ex.Message, Type = "FullSync" });
            }
        }

        // Método para obtener programas de una máquina específica
        public async Task GetMachinePrograms(int machineNumber)
        {
            try
            {
                var programs = await _machineProgramService.GetByMachineNumberAsync(machineNumber);
                
                await Clients.Caller.SendAsync("machine:programs", new
                {
                    MachineNumber = machineNumber,
                    Programs = programs,
                    Timestamp = DateTime.UtcNow
                });
                
                _logger.LogInformation($"Programas de máquina {machineNumber} enviados a {Context.ConnectionId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo programas de máquina {machineNumber}");
                await Clients.Caller.SendAsync("Error", new { Message = ex.Message, Type = "GetMachinePrograms" });
            }
        }

        // Método para enviar heartbeat/ping
        public async Task Ping()
        {
            await Clients.Caller.SendAsync("Pong", new
            {
                Timestamp = DateTime.UtcNow,
                ConnectionId = Context.ConnectionId
            });
        }

        // Método privado para obtener el ID del usuario actual
        private int GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Usuario no autenticado o ID inválido");
        }
    }

    // Extensiones para facilitar el uso del hub desde servicios
    public static class MachineProgramHubExtensions
    {
        public static async Task NotifyProgramCreated(this IHubContext<MachineProgramHub> hubContext, MachineProgramDto program)
        {
            await hubContext.Clients.Group("MachineProgramSync").SendAsync("program:created", program);
            await hubContext.Clients.Group($"Machine_{program.MachineNumber}").SendAsync("program:created", program);
        }

        public static async Task NotifyProgramUpdated(this IHubContext<MachineProgramHub> hubContext, MachineProgramDto program)
        {
            await hubContext.Clients.Group("MachineProgramSync").SendAsync("program:updated", program);
            await hubContext.Clients.Group($"Machine_{program.MachineNumber}").SendAsync("program:updated", program);
        }

        public static async Task NotifyStatusChanged(this IHubContext<MachineProgramHub> hubContext, int programId, string status, int machineNumber, string? observaciones = null)
        {
            var statusChangeEvent = new
            {
                ProgramId = programId,
                Status = status,
                MachineNumber = machineNumber,
                Observaciones = observaciones,
                ChangedAt = DateTime.UtcNow
            };

            await hubContext.Clients.Group("MachineProgramSync").SendAsync("status:changed", statusChangeEvent);
            await hubContext.Clients.Group($"Machine_{machineNumber}").SendAsync("status:changed", statusChangeEvent);
        }

        public static async Task NotifyProgramDeleted(this IHubContext<MachineProgramHub> hubContext, int programId, int machineNumber)
        {
            var deleteEvent = new
            {
                ProgramId = programId,
                MachineNumber = machineNumber,
                DeletedAt = DateTime.UtcNow
            };

            await hubContext.Clients.Group("MachineProgramSync").SendAsync("program:deleted", deleteEvent);
            await hubContext.Clients.Group($"Machine_{machineNumber}").SendAsync("program:deleted", deleteEvent);
        }
    }
}
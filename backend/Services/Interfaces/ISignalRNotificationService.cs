namespace FlexoAPP.API.Services
{
    /// <summary>
    /// Servicio para enviar notificaciones en tiempo real vía SignalR
    /// </summary>
    public interface ISignalRNotificationService
    {
        /// <summary>
        /// Notificar que una máquina fue actualizada
        /// </summary>
        Task NotifyMachineUpdated(string otSap, int machineNumber, string action, string? userName = null);

        /// <summary>
        /// Notificar cambio de estado de una máquina
        /// </summary>
        Task NotifyMachineStateChanged(string otSap, int machineNumber, string? oldState, string? newState, string? userName = null);

        /// <summary>
        /// Notificar que se importó un Excel
        /// </summary>
        Task NotifyExcelImported(int machineNumber, int created, int updated, string? userName = null);

        /// <summary>
        /// Notificar que una máquina fue eliminada
        /// </summary>
        Task NotifyMachineDeleted(string otSap, int machineNumber, string? userName = null);

        /// <summary>
        /// Notificar a todos los clientes que deben refrescar
        /// </summary>
        Task NotifyRefreshAll(string reason);

        /// <summary>
        /// Notificar actualización de máquina con objeto personalizado
        /// </summary>
        Task NotifyMachineUpdatedAsync(object notification);
    }
}

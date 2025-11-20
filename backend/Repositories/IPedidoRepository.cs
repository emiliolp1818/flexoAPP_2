using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;

namespace flexoAPP.Repositories
{
    public interface IPedidoRepository
    {
        Task<IEnumerable<Pedido>> GetAllAsync();
        Task<Pedido?> GetByIdAsync(int id);
        Task<IEnumerable<Pedido>> GetByMachineNumberAsync(int machineNumber);
        Task<IEnumerable<Pedido>> GetByEstadoAsync(string estado);
        Task<IEnumerable<Pedido>> GetByClienteAsync(string cliente);
        Task<IEnumerable<Pedido>> GetByPrioridadAsync(string prioridad);
        Task<Pedido> CreateAsync(Pedido pedido);
        Task<Pedido> UpdateAsync(Pedido pedido);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsByNumeroPedidoAsync(string numeroPedido, int? excludeId = null);
        Task<PedidoStatisticsDto> GetStatisticsAsync();
        Task<IEnumerable<Pedido>> GetPedidosActivosAsync();
        Task<IEnumerable<int>> GetMaquinasConPedidosAsync();
        Task<IEnumerable<Pedido>> GetPedidosVencidosAsync();
        Task<IEnumerable<Pedido>> GetPedidosPorFechaAsync(DateTime fechaInicio, DateTime fechaFin);
    }
}
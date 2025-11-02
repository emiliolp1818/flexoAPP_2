using flexoAPP.Models.DTOs;

namespace flexoAPP.Services
{
    public interface IPedidoService
    {
        Task<IEnumerable<PedidoDto>> GetAllAsync();
        Task<PedidoDto?> GetByIdAsync(int id);
        Task<IEnumerable<PedidoDto>> GetByMachineNumberAsync(int machineNumber);
        Task<IEnumerable<PedidoDto>> GetByEstadoAsync(string estado);
        Task<IEnumerable<PedidoDto>> GetByClienteAsync(string cliente);
        Task<IEnumerable<PedidoDto>> GetByPrioridadAsync(string prioridad);
        Task<PedidoDto> CreateAsync(CreatePedidoDto createDto, int userId);
        Task<PedidoDto> UpdateAsync(int id, UpdatePedidoDto updateDto, int userId);
        Task<PedidoDto> ChangeEstadoAsync(int id, ChangeEstadoPedidoDto changeEstadoDto, int userId);
        Task<bool> DeleteAsync(int id);
        Task<PedidoStatisticsDto> GetStatisticsAsync();
        Task<IEnumerable<PedidoDto>> GetPedidosActivosAsync();
        Task<IEnumerable<int>> GetMaquinasConPedidosAsync();
        Task<IEnumerable<PedidoDto>> GetPedidosVencidosAsync();
        Task<IEnumerable<PedidoDto>> GetPedidosPorFechaAsync(DateTime fechaInicio, DateTime fechaFin);
        Task<bool> ValidateNumeroPedidoAsync(string numeroPedido, int? excludeId = null);
        Task<IEnumerable<PedidoDto>> CreatePedidosParaMaquinaAsync(int machineNumber, int cantidad, int userId);
    }
}
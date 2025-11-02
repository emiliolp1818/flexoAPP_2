using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;
using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace flexoAPP.Repositories
{
    public class PedidoRepository : IPedidoRepository
    {
        private readonly FlexoAPPDbContext _context;
        private readonly ILogger<PedidoRepository> _logger;

        public PedidoRepository(FlexoAPPDbContext context, ILogger<PedidoRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Pedido>> GetAllAsync()
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Pedido?> GetByIdAsync(int id)
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Pedido>> GetByMachineNumberAsync(int machineNumber)
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Where(p => p.MachineNumber == machineNumber)
                .OrderBy(p => p.FechaPedido)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetByEstadoAsync(string estado)
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Where(p => p.Estado == estado)
                .OrderBy(p => p.FechaPedido)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetByClienteAsync(string cliente)
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Where(p => p.Cliente.Contains(cliente))
                .OrderBy(p => p.FechaPedido)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetByPrioridadAsync(string prioridad)
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Where(p => p.Prioridad == prioridad)
                .OrderBy(p => p.FechaPedido)
                .ToListAsync();
        }

        public async Task<Pedido> CreateAsync(Pedido pedido)
        {
            pedido.CreatedAt = DateTime.UtcNow;
            pedido.UpdatedAt = DateTime.UtcNow;
            pedido.FechaPedido = DateTime.UtcNow;

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(pedido.Id) ?? pedido;
        }

        public async Task<Pedido> UpdateAsync(Pedido pedido)
        {
            pedido.UpdatedAt = DateTime.UtcNow;
            
            _context.Pedidos.Update(pedido);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(pedido.Id) ?? pedido;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
                return false;

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsByNumeroPedidoAsync(string numeroPedido, int? excludeId = null)
        {
            var query = _context.Pedidos.Where(p => p.NumeroPedido == numeroPedido);
            
            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<PedidoStatisticsDto> GetStatisticsAsync()
        {
            var pedidos = await _context.Pedidos.ToListAsync();

            var stats = new PedidoStatisticsDto
            {
                TotalPedidos = pedidos.Count,
                PedidosPendientes = pedidos.Count(p => p.Estado == "PENDIENTE"),
                PedidosEnProceso = pedidos.Count(p => p.Estado == "EN_PROCESO"),
                PedidosCompletados = pedidos.Count(p => p.Estado == "COMPLETADO"),
                PedidosCancelados = pedidos.Count(p => p.Estado == "CANCELADO"),
                CantidadTotalPendiente = pedidos.Where(p => p.Estado == "PENDIENTE" || p.Estado == "EN_PROCESO").Sum(p => p.Cantidad),
                CantidadTotalCompletada = pedidos.Where(p => p.Estado == "COMPLETADO").Sum(p => p.Cantidad)
            };

            // Pedidos por máquina
            stats.PedidosPorMaquina = pedidos
                .GroupBy(p => p.MachineNumber)
                .ToDictionary(g => g.Key, g => g.Count());

            // Pedidos por prioridad
            stats.PedidosPorPrioridad = pedidos
                .GroupBy(p => p.Prioridad)
                .ToDictionary(g => g.Key, g => g.Count());

            return stats;
        }

        public async Task<IEnumerable<Pedido>> GetPedidosActivosAsync()
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Where(p => p.Estado == "PENDIENTE" || p.Estado == "EN_PROCESO")
                .OrderBy(p => p.FechaPedido)
                .ToListAsync();
        }

        public async Task<IEnumerable<int>> GetMaquinasConPedidosAsync()
        {
            return await _context.Pedidos
                .Where(p => p.Estado == "PENDIENTE" || p.Estado == "EN_PROCESO")
                .Select(p => p.MachineNumber)
                .Distinct()
                .OrderBy(m => m)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetPedidosVencidosAsync()
        {
            var fechaActual = DateTime.UtcNow;
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Where(p => (p.Estado == "PENDIENTE" || p.Estado == "EN_PROCESO") && 
                           p.FechaEntrega.HasValue && 
                           p.FechaEntrega.Value < fechaActual)
                .OrderBy(p => p.FechaEntrega)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetPedidosPorFechaAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            return await _context.Pedidos
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .Where(p => p.FechaPedido >= fechaInicio && p.FechaPedido <= fechaFin)
                .OrderBy(p => p.FechaPedido)
                .ToListAsync();
        }
    }
}
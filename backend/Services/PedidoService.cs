using AutoMapper;
using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;
using flexoAPP.Repositories;
using FlexoAPP.API.Services;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace flexoAPP.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly IPedidoRepository _repository;
        private readonly IMapper _mapper;
        private readonly IAuditService _auditService;
        private readonly ILogger<PedidoService> _logger;

        // Datos de ejemplo para generar pedidos
        private readonly string[] _clientesEjemplo = {
            "ALPINA S.A.", "NESTLE COLOMBIA", "UNILEVER ANDINA", "COLGATE PALMOLIVE",
            "JOHNSON & JOHNSON", "PROCTER & GAMBLE", "COCA COLA FEMSA", "BAVARIA S.A.",
            "GRUPO NUTRESA", "MONDELEZ INTERNATIONAL", "KIMBERLY CLARK", "HENKEL COLOMBIA"
        };

        private readonly string[] _articulosEjemplo = {
            "ETIQ001", "ETIQ002", "ETIQ003", "ETIQ004", "ETIQ005",
            "FLEX001", "FLEX002", "FLEX003", "FLEX004", "FLEX005",
            "PACK001", "PACK002", "PACK003", "PACK004", "PACK005"
        };

        private readonly string[] _descripcionesEjemplo = {
            "Etiqueta adhesiva para producto lácteo",
            "Empaque flexible para snacks",
            "Etiqueta termoencogible para bebidas",
            "Film metalizado para chocolates",
            "Etiqueta transparente para cosméticos",
            "Empaque biodegradable para alimentos",
            "Etiqueta holográfica de seguridad",
            "Film barrera para productos farmacéuticos",
            "Etiqueta resistente al agua",
            "Empaque retráctil para multipack"
        };

        public PedidoService(
            IPedidoRepository repository,
            IMapper mapper,
            IAuditService auditService,
            ILogger<PedidoService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _auditService = auditService;
            _logger = logger;
        }

        public async Task<IEnumerable<PedidoDto>> GetAllAsync()
        {
            var pedidos = await _repository.GetAllAsync();
            return pedidos.Select(MapToDto);
        }

        public async Task<PedidoDto?> GetByIdAsync(int id)
        {
            var pedido = await _repository.GetByIdAsync(id);
            return pedido != null ? MapToDto(pedido) : null;
        }

        public async Task<IEnumerable<PedidoDto>> GetByMachineNumberAsync(int machineNumber)
        {
            var pedidos = await _repository.GetByMachineNumberAsync(machineNumber);
            return pedidos.Select(MapToDto);
        }

        public async Task<IEnumerable<PedidoDto>> GetByEstadoAsync(string estado)
        {
            var pedidos = await _repository.GetByEstadoAsync(estado);
            return pedidos.Select(MapToDto);
        }

        public async Task<IEnumerable<PedidoDto>> GetByClienteAsync(string cliente)
        {
            var pedidos = await _repository.GetByClienteAsync(cliente);
            return pedidos.Select(MapToDto);
        }

        public async Task<IEnumerable<PedidoDto>> GetByPrioridadAsync(string prioridad)
        {
            var pedidos = await _repository.GetByPrioridadAsync(prioridad);
            return pedidos.Select(MapToDto);
        }

        public async Task<PedidoDto> CreateAsync(CreatePedidoDto createDto, int userId)
        {
            // Validar que no exista un pedido con el mismo número
            if (await _repository.ExistsByNumeroPedidoAsync(createDto.NumeroPedido))
            {
                throw new InvalidOperationException($"Ya existe un pedido con el número: {createDto.NumeroPedido}");
            }

            var pedido = new Pedido
            {
                MachineNumber = createDto.MachineNumber,
                NumeroPedido = createDto.NumeroPedido,
                Articulo = createDto.Articulo,
                Cliente = createDto.Cliente,
                Descripcion = createDto.Descripcion,
                Cantidad = createDto.Cantidad,
                Unidad = createDto.Unidad,
                Estado = "PENDIENTE",
                FechaEntrega = createDto.FechaEntrega,
                Prioridad = createDto.Prioridad,
                Observaciones = createDto.Observaciones,
                CreatedBy = userId,
                UpdatedBy = userId
            };

            var createdPedido = await _repository.CreateAsync(pedido);
            var createdDto = MapToDto(createdPedido);

            // Auditoría
            await _auditService.LogAsync(
                userId,
                "CREATE",
                "Pedido",
                createdPedido.Id,
                null,
                JsonSerializer.Serialize(createdDto)
            );

            _logger.LogInformation($"Pedido creado: {createdDto.NumeroPedido} para máquina {createdDto.MachineNumber}");

            return createdDto;
        }

        public async Task<PedidoDto> UpdateAsync(int id, UpdatePedidoDto updateDto, int userId)
        {
            var existingPedido = await _repository.GetByIdAsync(id);
            if (existingPedido == null)
            {
                throw new KeyNotFoundException($"Pedido con ID {id} no encontrado");
            }

            // Validar número de pedido si se está actualizando
            if (!string.IsNullOrEmpty(updateDto.NumeroPedido) && 
                updateDto.NumeroPedido != existingPedido.NumeroPedido &&
                await _repository.ExistsByNumeroPedidoAsync(updateDto.NumeroPedido, id))
            {
                throw new InvalidOperationException($"Ya existe un pedido con el número: {updateDto.NumeroPedido}");
            }

            var oldData = JsonSerializer.Serialize(MapToDto(existingPedido));

            // Actualizar solo los campos proporcionados
            if (!string.IsNullOrEmpty(updateDto.NumeroPedido))
                existingPedido.NumeroPedido = updateDto.NumeroPedido;
            
            if (!string.IsNullOrEmpty(updateDto.Articulo))
                existingPedido.Articulo = updateDto.Articulo;
            
            if (!string.IsNullOrEmpty(updateDto.Cliente))
                existingPedido.Cliente = updateDto.Cliente;
            
            if (!string.IsNullOrEmpty(updateDto.Descripcion))
                existingPedido.Descripcion = updateDto.Descripcion;
            
            if (updateDto.Cantidad.HasValue)
                existingPedido.Cantidad = updateDto.Cantidad.Value;
            
            if (!string.IsNullOrEmpty(updateDto.Unidad))
                existingPedido.Unidad = updateDto.Unidad;
            
            if (!string.IsNullOrEmpty(updateDto.Estado))
                existingPedido.Estado = updateDto.Estado;
            
            if (updateDto.FechaEntrega.HasValue)
                existingPedido.FechaEntrega = updateDto.FechaEntrega.Value;
            
            if (!string.IsNullOrEmpty(updateDto.Prioridad))
                existingPedido.Prioridad = updateDto.Prioridad;
            
            if (updateDto.Observaciones != null)
                existingPedido.Observaciones = updateDto.Observaciones;

            if (!string.IsNullOrEmpty(updateDto.AsignadoA))
            {
                existingPedido.AsignadoA = updateDto.AsignadoA;
                existingPedido.FechaAsignacion = DateTime.UtcNow;
            }

            existingPedido.UpdatedBy = userId;

            var updatedPedido = await _repository.UpdateAsync(existingPedido);
            var updatedDto = MapToDto(updatedPedido);

            // Auditoría
            await _auditService.LogAsync(
                userId,
                "UPDATE",
                "Pedido",
                updatedPedido.Id,
                oldData,
                JsonSerializer.Serialize(updatedDto)
            );

            _logger.LogInformation($"Pedido actualizado: {updatedDto.NumeroPedido}");

            return updatedDto;
        }

        public async Task<PedidoDto> ChangeEstadoAsync(int id, ChangeEstadoPedidoDto changeEstadoDto, int userId)
        {
            var existingPedido = await _repository.GetByIdAsync(id);
            if (existingPedido == null)
            {
                throw new KeyNotFoundException($"Pedido con ID {id} no encontrado");
            }

            var oldData = JsonSerializer.Serialize(MapToDto(existingPedido));
            var oldEstado = existingPedido.Estado;

            existingPedido.Estado = changeEstadoDto.Estado;
            existingPedido.UpdatedBy = userId;

            // Lógica específica por estado
            switch (changeEstadoDto.Estado)
            {
                case "EN_PROCESO":
                    if (!string.IsNullOrEmpty(changeEstadoDto.AsignadoA))
                    {
                        existingPedido.AsignadoA = changeEstadoDto.AsignadoA;
                        existingPedido.FechaAsignacion = DateTime.UtcNow;
                    }
                    break;
                
                case "COMPLETADO":
                    // El pedido se marca como completado
                    break;
                
                case "CANCELADO":
                    if (!string.IsNullOrEmpty(changeEstadoDto.Observaciones))
                    {
                        existingPedido.Observaciones = changeEstadoDto.Observaciones;
                    }
                    break;
            }

            var updatedPedido = await _repository.UpdateAsync(existingPedido);
            var updatedDto = MapToDto(updatedPedido);

            // Auditoría
            await _auditService.LogAsync(
                userId,
                "STATUS_CHANGE",
                "Pedido",
                updatedPedido.Id,
                $"Estado: {oldEstado}",
                $"Estado: {updatedPedido.Estado}"
            );

            _logger.LogInformation($"Estado de pedido cambiado: {updatedPedido.NumeroPedido} de {oldEstado} a {updatedPedido.Estado}");

            return updatedDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existingPedido = await _repository.GetByIdAsync(id);
            if (existingPedido == null)
            {
                return false;
            }

            return await _repository.DeleteAsync(id);
        }

        public async Task<PedidoStatisticsDto> GetStatisticsAsync()
        {
            return await _repository.GetStatisticsAsync();
        }

        public async Task<IEnumerable<PedidoDto>> GetPedidosActivosAsync()
        {
            var pedidos = await _repository.GetPedidosActivosAsync();
            return pedidos.Select(MapToDto);
        }

        public async Task<IEnumerable<int>> GetMaquinasConPedidosAsync()
        {
            return await _repository.GetMaquinasConPedidosAsync();
        }

        public async Task<IEnumerable<PedidoDto>> GetPedidosVencidosAsync()
        {
            var pedidos = await _repository.GetPedidosVencidosAsync();
            return pedidos.Select(MapToDto);
        }

        public async Task<IEnumerable<PedidoDto>> GetPedidosPorFechaAsync(DateTime fechaInicio, DateTime fechaFin)
        {
            var pedidos = await _repository.GetPedidosPorFechaAsync(fechaInicio, fechaFin);
            return pedidos.Select(MapToDto);
        }

        public async Task<bool> ValidateNumeroPedidoAsync(string numeroPedido, int? excludeId = null)
        {
            return !await _repository.ExistsByNumeroPedidoAsync(numeroPedido, excludeId);
        }

        public async Task<IEnumerable<PedidoDto>> CreatePedidosParaMaquinaAsync(int machineNumber, int cantidad, int userId)
        {
            var pedidosCreados = new List<PedidoDto>();
            var random = new Random();

            for (int i = 1; i <= cantidad; i++)
            {
                var numeroPedido = $"PED-{machineNumber:D2}-{DateTime.Now:yyyyMMdd}-{i:D3}";
                
                // Verificar que el número de pedido no exista
                var contador = 1;
                var numeroPedidoOriginal = numeroPedido;
                while (await _repository.ExistsByNumeroPedidoAsync(numeroPedido))
                {
                    numeroPedido = $"{numeroPedidoOriginal}-{contador:D2}";
                    contador++;
                }

                var cliente = _clientesEjemplo[random.Next(_clientesEjemplo.Length)];
                var articulo = _articulosEjemplo[random.Next(_articulosEjemplo.Length)];
                var descripcion = _descripcionesEjemplo[random.Next(_descripcionesEjemplo.Length)];
                var cantidad_pedido = Math.Round((decimal)(random.NextDouble() * 1000 + 100), 2);
                var prioridades = new[] { "BAJA", "NORMAL", "ALTA", "URGENTE" };
                var prioridad = prioridades[random.Next(prioridades.Length)];

                var createDto = new CreatePedidoDto
                {
                    MachineNumber = machineNumber,
                    NumeroPedido = numeroPedido,
                    Articulo = $"{articulo}-{i:D3}",
                    Cliente = cliente,
                    Descripcion = descripcion,
                    Cantidad = cantidad_pedido,
                    Unidad = "kg",
                    FechaEntrega = DateTime.UtcNow.AddDays(random.Next(7, 30)),
                    Prioridad = prioridad,
                    Observaciones = $"Pedido generado automáticamente para máquina {machineNumber}"
                };

                try
                {
                    var pedidoCreado = await CreateAsync(createDto, userId);
                    pedidosCreados.Add(pedidoCreado);
                    _logger.LogInformation($"Pedido automático creado: {pedidoCreado.NumeroPedido}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error creando pedido automático {numeroPedido}");
                }
            }

            return pedidosCreados;
        }

        private PedidoDto MapToDto(Pedido pedido)
        {
            return new PedidoDto
            {
                Id = pedido.Id,
                MachineNumber = pedido.MachineNumber,
                NumeroPedido = pedido.NumeroPedido,
                Articulo = pedido.Articulo,
                Cliente = pedido.Cliente,
                Descripcion = pedido.Descripcion,
                Cantidad = pedido.Cantidad,
                Unidad = pedido.Unidad,
                Estado = pedido.Estado,
                FechaPedido = pedido.FechaPedido,
                FechaEntrega = pedido.FechaEntrega,
                Prioridad = pedido.Prioridad,
                Observaciones = pedido.Observaciones,
                AsignadoA = pedido.AsignadoA,
                FechaAsignacion = pedido.FechaAsignacion,
                CreatedBy = pedido.CreatedBy,
                UpdatedBy = pedido.UpdatedBy,
                CreatedAt = pedido.CreatedAt,
                UpdatedAt = pedido.UpdatedAt
            };
        }
    }
}
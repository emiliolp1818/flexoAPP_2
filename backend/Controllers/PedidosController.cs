using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using flexoAPP.Services;
using flexoAPP.Models.DTOs;
using System.Security.Claims;

namespace flexoAPP.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;
        private readonly ILogger<PedidosController> _logger;

        public PedidosController(
            IPedidoService pedidoService,
            ILogger<PedidosController> logger)
        {
            _pedidoService = pedidoService;
            _logger = logger;
        }

        /// <summary>
        /// Obtener todos los pedidos
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetAll()
        {
            try
            {
                var pedidos = await _pedidoService.GetAllAsync();
                return Ok(new { success = true, data = pedidos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo todos los pedidos");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener pedido por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PedidoDto>> GetById(int id)
        {
            try
            {
                var pedido = await _pedidoService.GetByIdAsync(id);
                if (pedido == null)
                {
                    return NotFound(new { success = false, error = "Pedido no encontrado" });
                }

                return Ok(new { success = true, data = pedido });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo pedido con ID {id}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener pedidos por número de máquina
        /// </summary>
        [HttpGet("machine/{machineNumber}")]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetByMachine(int machineNumber)
        {
            try
            {
                if (machineNumber < 11 || machineNumber > 21)
                {
                    return BadRequest(new { success = false, error = "Número de máquina debe estar entre 11 y 21" });
                }

                var pedidos = await _pedidoService.GetByMachineNumberAsync(machineNumber);
                return Ok(new { success = true, data = pedidos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo pedidos de máquina {machineNumber}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener pedidos por estado
        /// </summary>
        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetByEstado(string estado)
        {
            try
            {
                var validEstados = new[] { "PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO" };
                if (!validEstados.Contains(estado.ToUpper()))
                {
                    return BadRequest(new { success = false, error = "Estado inválido" });
                }

                var pedidos = await _pedidoService.GetByEstadoAsync(estado.ToUpper());
                return Ok(new { success = true, data = pedidos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo pedidos con estado {estado}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener pedidos por cliente
        /// </summary>
        [HttpGet("cliente/{cliente}")]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetByCliente(string cliente)
        {
            try
            {
                var pedidos = await _pedidoService.GetByClienteAsync(cliente);
                return Ok(new { success = true, data = pedidos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error obteniendo pedidos del cliente {cliente}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear nuevo pedido
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PedidoDto>> Create([FromBody] CreatePedidoDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, error = "Datos inválidos", details = ModelState });
                }

                // Validar número de máquina
                if (createDto.MachineNumber < 11 || createDto.MachineNumber > 21)
                {
                    return BadRequest(new { success = false, error = "Número de máquina debe estar entre 11 y 21" });
                }

                var userId = GetCurrentUserId();
                var createdPedido = await _pedidoService.CreateAsync(createDto, userId);

                return CreatedAtAction(
                    nameof(GetById), 
                    new { id = createdPedido.Id }, 
                    new { success = true, data = createdPedido }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando pedido");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualizar pedido existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<PedidoDto>> Update(int id, [FromBody] UpdatePedidoDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, error = "Datos inválidos", details = ModelState });
                }

                var userId = GetCurrentUserId();
                var updatedPedido = await _pedidoService.UpdateAsync(id, updateDto, userId);

                return Ok(new { success = true, data = updatedPedido });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error actualizando pedido {id}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Cambiar estado de pedido
        /// </summary>
        [HttpPatch("{id}/estado")]
        public async Task<ActionResult<PedidoDto>> ChangeEstado(int id, [FromBody] ChangeEstadoPedidoDto changeEstadoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, error = "Datos inválidos", details = ModelState });
                }

                var validEstados = new[] { "PENDIENTE", "EN_PROCESO", "COMPLETADO", "CANCELADO" };
                if (!validEstados.Contains(changeEstadoDto.Estado.ToUpper()))
                {
                    return BadRequest(new { success = false, error = "Estado inválido" });
                }

                var userId = GetCurrentUserId();
                var updatedPedido = await _pedidoService.ChangeEstadoAsync(id, changeEstadoDto, userId);

                return Ok(new { success = true, data = updatedPedido });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cambiando estado del pedido {id}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Eliminar pedido
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var success = await _pedidoService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new { success = false, error = "Pedido no encontrado" });
                }

                return Ok(new { success = true, message = "Pedido eliminado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error eliminando pedido {id}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener estadísticas de pedidos
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<PedidoStatisticsDto>> GetStatistics()
        {
            try
            {
                var statistics = await _pedidoService.GetStatisticsAsync();
                return Ok(new { success = true, data = statistics });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo estadísticas de pedidos");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener pedidos activos
        /// </summary>
        [HttpGet("activos")]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetPedidosActivos()
        {
            try
            {
                var pedidosActivos = await _pedidoService.GetPedidosActivosAsync();
                return Ok(new { success = true, data = pedidosActivos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo pedidos activos");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener máquinas con pedidos
        /// </summary>
        [HttpGet("maquinas-con-pedidos")]
        public async Task<ActionResult<IEnumerable<int>>> GetMaquinasConPedidos()
        {
            try
            {
                var maquinas = await _pedidoService.GetMaquinasConPedidosAsync();
                return Ok(new { success = true, data = maquinas });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo máquinas con pedidos");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtener pedidos vencidos
        /// </summary>
        [HttpGet("vencidos")]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> GetPedidosVencidos()
        {
            try
            {
                var pedidosVencidos = await _pedidoService.GetPedidosVencidosAsync();
                return Ok(new { success = true, data = pedidosVencidos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo pedidos vencidos");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear pedidos automáticamente para una máquina
        /// </summary>
        [HttpPost("crear-automaticos/{machineNumber}")]
        public async Task<ActionResult<IEnumerable<PedidoDto>>> CreatePedidosAutomaticos(int machineNumber, [FromQuery] int cantidad = 10)
        {
            try
            {
                if (machineNumber < 11 || machineNumber > 21)
                {
                    return BadRequest(new { success = false, error = "Número de máquina debe estar entre 11 y 21" });
                }

                if (cantidad < 1 || cantidad > 50)
                {
                    return BadRequest(new { success = false, error = "La cantidad debe estar entre 1 y 50" });
                }

                var userId = GetCurrentUserId();
                var pedidosCreados = await _pedidoService.CreatePedidosParaMaquinaAsync(machineNumber, cantidad, userId);

                return Ok(new { 
                    success = true, 
                    data = pedidosCreados,
                    message = $"Se crearon {pedidosCreados.Count()} pedidos para la máquina {machineNumber}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creando pedidos automáticos para máquina {machineNumber}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Crear pedidos para todas las máquinas
        /// </summary>
        [HttpPost("crear-para-todas-maquinas")]
        public async Task<ActionResult> CreatePedidosParaTodasMaquinas([FromQuery] int cantidadPorMaquina = 10)
        {
            try
            {
                if (cantidadPorMaquina < 1 || cantidadPorMaquina > 50)
                {
                    return BadRequest(new { success = false, error = "La cantidad por máquina debe estar entre 1 y 50" });
                }

                var userId = GetCurrentUserId();
                var resultados = new List<object>();
                var maquinas = new[] { 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 };

                foreach (var machineNumber in maquinas)
                {
                    try
                    {
                        var pedidosCreados = await _pedidoService.CreatePedidosParaMaquinaAsync(machineNumber, cantidadPorMaquina, userId);
                        resultados.Add(new { 
                            machineNumber, 
                            success = true, 
                            count = pedidosCreados.Count(),
                            message = $"Creados {pedidosCreados.Count()} pedidos"
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error creando pedidos para máquina {machineNumber}");
                        resultados.Add(new { 
                            machineNumber, 
                            success = false, 
                            error = ex.Message 
                        });
                    }
                }

                var totalCreados = resultados.Where(r => (bool)r.GetType().GetProperty("success")!.GetValue(r)!)
                                            .Sum(r => (int)r.GetType().GetProperty("count")!.GetValue(r)!);

                return Ok(new { 
                    success = true, 
                    data = resultados,
                    summary = new {
                        totalMaquinas = maquinas.Length,
                        totalPedidosCreados = totalCreados,
                        cantidadPorMaquina
                    },
                    message = $"Proceso completado. Se crearon {totalCreados} pedidos en total."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando pedidos para todas las máquinas");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Validar número de pedido único
        /// </summary>
        [HttpGet("validate-numero-pedido")]
        public async Task<ActionResult<bool>> ValidateNumeroPedido([FromQuery] string numeroPedido, [FromQuery] int? excludeId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(numeroPedido))
                {
                    return BadRequest(new { success = false, error = "Número de pedido es requerido" });
                }

                var isValid = await _pedidoService.ValidateNumeroPedidoAsync(numeroPedido, excludeId);
                
                return Ok(new { success = true, data = new { isValid, numeroPedido } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validando número de pedido {numeroPedido}");
                return StatusCode(500, new { success = false, error = "Error interno del servidor" });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Usuario no autenticado");
        }
    }
}
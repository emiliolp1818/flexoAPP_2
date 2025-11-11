// ===== CONTROLADOR DE CONDICIÓN ÚNICA =====
// API REST para gestionar operaciones CRUD de Condición Única
// Proporciona endpoints para crear, leer, actualizar y eliminar registros

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Repositories;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Controllers
{
    /// <summary>
    /// Controlador de Condición Única
    /// Maneja las peticiones HTTP para la gestión de registros de Condición Única
    /// </summary>
    [ApiController]
    [Route("api/condicion-unica")]
    public class CondicionUnicaController : ControllerBase
    {
        // Repositorio inyectado para acceso a datos
        private readonly ICondicionUnicaRepository _repository;
        // Logger para registro de eventos y errores
        private readonly ILogger<CondicionUnicaController> _logger;

        /// <summary>
        /// Constructor del controlador
        /// </summary>
        /// <param name="repository">Repositorio de Condición Única</param>
        /// <param name="logger">Logger para registro de eventos</param>
        public CondicionUnicaController(
            ICondicionUnicaRepository repository,
            ILogger<CondicionUnicaController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        /// <summary>
        /// Test endpoint - Verificar que el controlador funciona
        /// GET: api/condicion-unica/test
        /// </summary>
        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { 
                message = "Condicion Unica Controller is working", 
                timestamp = DateTime.UtcNow,
                status = "OK"
            });
        }

        /// <summary>
        /// Obtener todos los registros de Condición Única
        /// GET: api/condicion-unica
        /// </summary>
        /// <returns>Lista de todos los registros</returns>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CondicionUnica>>> GetAll()
        {
            try
            {
                // Log de la petición
                _logger.LogInformation("GET /api/condicion-unica - Obteniendo todos los registros");
                
                // Obtener todos los registros del repositorio
                var registros = await _repository.GetAllAsync();
                
                // Retornar respuesta exitosa con los registros
                return Ok(registros);
            }
            catch (Exception ex)
            {
                // Log del error
                _logger.LogError(ex, "Error al obtener registros de Condición Única");
                
                // Retornar error 500 con mensaje
                return StatusCode(500, new { message = "Error al obtener registros", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener un registro específico por ID
        /// GET: api/condicion-unica/{id}
        /// </summary>
        /// <param name="id">ID del registro a buscar</param>
        /// <returns>Registro encontrado o 404 si no existe</returns>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CondicionUnica>> GetById(int id)
        {
            try
            {
                // Log de la petición
                _logger.LogInformation($"GET /api/condicion-unica/{id} - Buscando registro");
                
                // Buscar registro por ID
                var registro = await _repository.GetByIdAsync(id);
                
                // Si no existe, retornar 404
                if (registro == null)
                {
                    _logger.LogWarning($"Registro con ID {id} no encontrado");
                    return NotFound(new { message = $"Registro con ID {id} no encontrado" });
                }
                
                // Retornar registro encontrado
                return Ok(registro);
            }
            catch (Exception ex)
            {
                // Log del error
                _logger.LogError(ex, $"Error al obtener registro con ID {id}");
                
                // Retornar error 500
                return StatusCode(500, new { message = "Error al obtener registro", error = ex.Message });
            }
        }

        /// <summary>
        /// Buscar registros por F Artículo
        /// GET: api/condicion-unica/search?fArticulo={fArticulo}
        /// </summary>
        /// <param name="fArticulo">Código del artículo F a buscar</param>
        /// <returns>Lista de registros que coinciden</returns>
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CondicionUnica>>> Search([FromQuery] string fArticulo)
        {
            try
            {
                // Validar que se proporcione el parámetro de búsqueda
                if (string.IsNullOrWhiteSpace(fArticulo))
                {
                    return BadRequest(new { message = "El parámetro fArticulo es requerido" });
                }
                
                // Log de la petición
                _logger.LogInformation($"GET /api/condicion-unica/search?fArticulo={fArticulo}");
                
                // Buscar registros por F Artículo
                var registros = await _repository.SearchByFArticuloAsync(fArticulo);
                
                // Retornar resultados de búsqueda
                return Ok(registros);
            }
            catch (Exception ex)
            {
                // Log del error
                _logger.LogError(ex, $"Error al buscar registros por F Artículo: {fArticulo}");
                
                // Retornar error 500
                return StatusCode(500, new { message = "Error al buscar registros", error = ex.Message });
            }
        }

        /// <summary>
        /// Crear un nuevo registro de Condición Única
        /// POST: api/condicion-unica
        /// </summary>
        /// <param name="condicion">Datos del nuevo registro</param>
        /// <returns>Registro creado con ID generado</returns>
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<CondicionUnica>> Create([FromBody] CondicionUnica condicion)
        {
            try
            {
                // Validar que se proporcionen los datos
                if (condicion == null)
                {
                    return BadRequest(new { message = "Los datos del registro son requeridos" });
                }
                
                // Validar campos requeridos
                if (string.IsNullOrWhiteSpace(condicion.FArticulo))
                {
                    return BadRequest(new { message = "El campo F Artículo es requerido" });
                }
                
                if (string.IsNullOrWhiteSpace(condicion.Referencia))
                {
                    return BadRequest(new { message = "El campo Referencia es requerido" });
                }
                
                if (string.IsNullOrWhiteSpace(condicion.Estante))
                {
                    return BadRequest(new { message = "El campo Estante es requerido" });
                }
                
                if (string.IsNullOrWhiteSpace(condicion.NumeroCarpeta))
                {
                    return BadRequest(new { message = "El campo Número de Carpeta es requerido" });
                }
                
                // Log de la petición
                _logger.LogInformation($"POST /api/condicion-unica - Creando registro: {condicion.FArticulo}");
                
                // Crear registro en el repositorio
                var registroCreado = await _repository.CreateAsync(condicion);
                
                // Retornar respuesta 201 Created con el registro creado
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = registroCreado.Id },
                    registroCreado
                );
            }
            catch (Exception ex)
            {
                // Log del error
                _logger.LogError(ex, "Error al crear registro de Condición Única");
                
                // Retornar error 500
                return StatusCode(500, new { message = "Error al crear registro", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar un registro existente
        /// PUT: api/condicion-unica/{id}
        /// </summary>
        /// <param name="id">ID del registro a actualizar</param>
        /// <param name="condicion">Datos actualizados</param>
        /// <returns>Registro actualizado</returns>
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CondicionUnica>> Update(int id, [FromBody] CondicionUnica condicion)
        {
            try
            {
                // Validar que se proporcionen los datos
                if (condicion == null)
                {
                    return BadRequest(new { message = "Los datos del registro son requeridos" });
                }
                
                // Validar que el ID coincida
                if (id != condicion.Id)
                {
                    return BadRequest(new { message = "El ID del registro no coincide con el ID de la URL" });
                }
                
                // Verificar que el registro existe
                var registroExistente = await _repository.GetByIdAsync(id);
                if (registroExistente == null)
                {
                    _logger.LogWarning($"Registro con ID {id} no encontrado para actualizar");
                    return NotFound(new { message = $"Registro con ID {id} no encontrado" });
                }
                
                // Log de la petición
                _logger.LogInformation($"PUT /api/condicion-unica/{id} - Actualizando registro");
                
                // Actualizar registro en el repositorio
                var registroActualizado = await _repository.UpdateAsync(condicion);
                
                // Retornar registro actualizado
                return Ok(registroActualizado);
            }
            catch (Exception ex)
            {
                // Log del error
                _logger.LogError(ex, $"Error al actualizar registro con ID {id}");
                
                // Retornar error 500
                return StatusCode(500, new { message = "Error al actualizar registro", error = ex.Message });
            }
        }

        /// <summary>
        /// Eliminar un registro
        /// DELETE: api/condicion-unica/{id}
        /// </summary>
        /// <param name="id">ID del registro a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                // Log de la petición
                _logger.LogInformation($"DELETE /api/condicion-unica/{id} - Eliminando registro");
                
                // Intentar eliminar el registro
                var eliminado = await _repository.DeleteAsync(id);
                
                // Si no existe, retornar 404
                if (!eliminado)
                {
                    _logger.LogWarning($"Registro con ID {id} no encontrado para eliminar");
                    return NotFound(new { message = $"Registro con ID {id} no encontrado" });
                }
                
                // Retornar confirmación de eliminación
                return Ok(new { message = "Registro eliminado exitosamente", id = id });
            }
            catch (Exception ex)
            {
                // Log del error
                _logger.LogError(ex, $"Error al eliminar registro con ID {id}");
                
                // Retornar error 500
                return StatusCode(500, new { message = "Error al eliminar registro", error = ex.Message });
            }
        }
    }
}

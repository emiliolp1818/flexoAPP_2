



using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAPP.API.Repositories;
using FlexoAPP.API.Models.Entities;

namespace FlexoAPP.API.Controllers
{




    [ApiController]
    [Route("api/condicion-unica")]
    public class CondicionUnicaController : ControllerBase
    {

        private readonly ICondicionUnicaRepository _repository;

        private readonly ILogger<CondicionUnicaController> _logger;






        public CondicionUnicaController(
            ICondicionUnicaRepository repository,
            ILogger<CondicionUnicaController> logger)
        {
            _repository = repository;
            _logger = logger;
        }





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





        [HttpGet("diagnostico")]
        [AllowAnonymous]
        public async Task<IActionResult> Diagnostico()
        {
            try
            {
                var registros = await _repository.GetAllAsync();
                var primerRegistro = registros.FirstOrDefault();

                return Ok(new {
                    message = "Diagnóstico de Condición Única",
                    totalRegistros = registros.Count(),
                    primerRegistro = primerRegistro,
                    camposDelModelo = new
                    {
                        id = primerRegistro?.Id,
                        fArticulo = primerRegistro?.FArticulo,
                        descripcion = primerRegistro?.Descripcion,
                        estante = primerRegistro?.Estante,
                        numeroCarpeta = primerRegistro?.NumeroCarpeta,
                        estado = primerRegistro?.Estado ?? "NULL",
                        createdDate = primerRegistro?.CreatedDate,
                        lastModified = primerRegistro?.LastModified
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return Ok(new {
                    message = "Error en diagnóstico",
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                });
            }
        }






        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CondicionUnica>>> GetAll()
        {
            try
            {

                _logger.LogInformation("GET /api/condicion-unica - Obteniendo todos los registros");


                var registros = await _repository.GetAllAsync();


                return Ok(registros);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "Error al obtener registros de Condición Única");


                return StatusCode(500, new { message = "Error al obtener registros", error = ex.Message });
            }
        }







        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CondicionUnica>> GetById(int id)
        {
            try
            {

                _logger.LogInformation($"GET /api/condicion-unica/{id} - Buscando registro");


                var registro = await _repository.GetByIdAsync(id);


                if (registro == null)
                {
                    _logger.LogWarning($"Registro con ID {id} no encontrado");
                    return NotFound(new { message = $"Registro con ID {id} no encontrado" });
                }


                return Ok(registro);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error al obtener registro con ID {id}");


                return StatusCode(500, new { message = "Error al obtener registro", error = ex.Message });
            }
        }







        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CondicionUnica>>> Search([FromQuery] string fArticulo)
        {
            try
            {

                if (string.IsNullOrWhiteSpace(fArticulo))
                {
                    return BadRequest(new { message = "El parámetro fArticulo es requerido" });
                }


                _logger.LogInformation($"GET /api/condicion-unica/search?fArticulo={fArticulo}");


                var registros = await _repository.SearchByFArticuloAsync(fArticulo);


                return Ok(registros);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error al buscar registros por F Artículo: {fArticulo}");


                return StatusCode(500, new { message = "Error al buscar registros", error = ex.Message });
            }
        }







        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<CondicionUnica>> Create([FromBody] CondicionUnica condicion)
        {
            try
            {

                if (condicion == null)
                {
                    return BadRequest(new { message = "Los datos del registro son requeridos" });
                }


                if (string.IsNullOrWhiteSpace(condicion.FArticulo))
                {
                    return BadRequest(new { message = "El campo F Artículo es requerido" });
                }

                if (string.IsNullOrWhiteSpace(condicion.Descripcion))
                {
                    return BadRequest(new { message = "El campo Descripción es requerido" });
                }

                if (string.IsNullOrWhiteSpace(condicion.Estante))
                {
                    return BadRequest(new { message = "El campo Estante es requerido" });
                }

                if (string.IsNullOrWhiteSpace(condicion.NumeroCarpeta))
                {
                    return BadRequest(new { message = "El campo Número de Carpeta es requerido" });
                }


                var exists = await _repository.ExistsByFArticuloAsync(condicion.FArticulo);
                if (exists)
                {
                    _logger.LogWarning($"Intento de crear registro duplicado: {condicion.FArticulo}");
                    return Conflict(new
                    {
                        success = false,
                        message = $"El registro con F Artículo '{condicion.FArticulo}' ya existe en el sistema",
                        errorType = "DUPLICATE_RECORD",
                        fArticulo = condicion.FArticulo
                    });
                }


                _logger.LogInformation($"POST /api/condicion-unica - Creando registro: {condicion.FArticulo}");


                var registroCreado = await _repository.CreateAsync(condicion);


                return CreatedAtAction(
                    nameof(GetById),
                    new { id = registroCreado.Id },
                    registroCreado
                );
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "Error al crear registro de Condición Única");


                return StatusCode(500, new { message = "Error al crear registro", error = ex.Message });
            }
        }








        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CondicionUnica>> Update(int id, [FromBody] CondicionUnica condicion)
        {
            try
            {

                if (condicion == null)
                {
                    return BadRequest(new { message = "Los datos del registro son requeridos" });
                }


                if (id != condicion.Id)
                {
                    return BadRequest(new { message = "El ID del registro no coincide con el ID de la URL" });
                }


                var registroExistente = await _repository.GetByIdAsync(id);
                if (registroExistente == null)
                {
                    _logger.LogWarning($"Registro con ID {id} no encontrado para actualizar");
                    return NotFound(new { message = $"Registro con ID {id} no encontrado" });
                }


                var exists = await _repository.ExistsByFArticuloAsync(condicion.FArticulo, id);
                if (exists)
                {
                    _logger.LogWarning($"Intento de actualizar a F Artículo duplicado: {condicion.FArticulo}");
                    return Conflict(new
                    {
                        success = false,
                        message = $"El F Artículo '{condicion.FArticulo}' ya existe en otro registro",
                        errorType = "DUPLICATE_RECORD",
                        fArticulo = condicion.FArticulo
                    });
                }


                _logger.LogInformation($"PUT /api/condicion-unica/{id} - Actualizando registro");


                var registroActualizado = await _repository.UpdateAsync(condicion);


                return Ok(registroActualizado);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error al actualizar registro con ID {id}");


                return StatusCode(500, new { message = "Error al actualizar registro", error = ex.Message });
            }
        }







        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {

                _logger.LogInformation($"DELETE /api/condicion-unica/{id} - Eliminando registro");


                var eliminado = await _repository.DeleteAsync(id);


                if (!eliminado)
                {
                    _logger.LogWarning($"Registro con ID {id} no encontrado para eliminar");
                    return NotFound(new { message = $"Registro con ID {id} no encontrado" });
                }


                return Ok(new { message = "Registro eliminado exitosamente", id = id });
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error al eliminar registro con ID {id}");


                return StatusCode(500, new { message = "Error al eliminar registro", error = ex.Message });
            }
        }
    }
}

// ===== CONTROLADOR DE DOCUMENTOS - FLEXOAPP =====
// API REST para gestionar operaciones CRUD de Documentos
// Proporciona endpoints para crear, leer, actualizar, eliminar y subir documentos

// Importar namespace de ASP.NET Core MVC para controladores
using Microsoft.AspNetCore.Mvc;
// Importar namespace para autorización y autenticación
using Microsoft.AspNetCore.Authorization;
// Importar namespace para manejo de archivos
using Microsoft.AspNetCore.Http;
// Importar namespace para operaciones de entrada/salida
using System.IO;
// Importar namespace para tareas asíncronas
using System.Threading.Tasks;
// Importar namespace para colecciones genéricas
using System.Collections.Generic;
// Importar namespace para LINQ (consultas)
using System.Linq;
// Importar namespace para conexión a MySQL
using MySql.Data.MySqlClient;
// Importar namespace para configuración
using Microsoft.Extensions.Configuration;
// Importar namespace para servicios del proyecto
using FlexoAPP.API.Services;

// Namespace del proyecto FlexoAPP
namespace FlexoAPP.API.Controllers
{
    /// <summary>
    /// Controlador de Documentos
    /// Maneja las peticiones HTTP para la gestión de documentos del sistema
    /// Incluye operaciones CRUD y subida de archivos
    /// </summary>
    // Atributo que marca esta clase como controlador de API
    [ApiController]
    // Atributo que define la ruta base del controlador: /api/documentos
    [Route("api/documentos")]
    // Clase que hereda de ControllerBase (clase base para controladores de API)
    public class DocumentosController : ControllerBase
    {
        // ===== PROPIEDADES PRIVADAS =====
        
        // Logger para registro de eventos y errores del controlador
        private readonly ILogger<DocumentosController> _logger;
        // Configuración de la aplicación (appsettings.json)
        private readonly IConfiguration _configuration;
        // Cadena de conexión a la base de datos MySQL
        private readonly string _connectionString;
        // Ruta base donde se almacenan los archivos subidos
        private readonly string _uploadsPath;
        // Servicio de conversión PDF sin marca de agua
        private readonly IPdfConversionService _pdfConversionService;

        /// <summary>
        /// Constructor del controlador
        /// Se ejecuta al crear una instancia del controlador
        /// ASP.NET Core inyecta automáticamente las dependencias
        /// </summary>
        /// <param name="logger">Logger para registro de eventos</param>
        /// <param name="configuration">Configuración de la aplicación</param>
        /// <param name="pdfConversionService">Servicio de conversión PDF</param>
        public DocumentosController(
            ILogger<DocumentosController> logger,
            IConfiguration configuration,
            IPdfConversionService pdfConversionService)
        {
            // Asignar el logger inyectado a la propiedad privada
            _logger = logger;
            // Asignar la configuración inyectada a la propiedad privada
            _configuration = configuration;
            // Asignar el servicio de conversión PDF
            _pdfConversionService = pdfConversionService;
            // Obtener la cadena de conexión desde appsettings.json
            // "DefaultConnection" es el nombre de la cadena de conexión en el archivo de configuración
            _connectionString = _configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found");
            // Definir la ruta donde se guardarán los archivos subidos
            // Path.Combine une las rutas de forma segura según el sistema operativo
            _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "documentos");
            
            // Crear el directorio de uploads si no existe
            // Directory.Exists verifica si el directorio existe
            if (!Directory.Exists(_uploadsPath))
            {
                // Directory.CreateDirectory crea el directorio y todos los directorios padres necesarios
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        // ===== ENDPOINTS DEL API =====

        /// <summary>
        /// Test endpoint - Verificar que el controlador funciona
        /// GET: api/documentos/test
        /// </summary>
        /// <returns>Mensaje de confirmación con timestamp</returns>
        // Atributo que indica que este método responde a peticiones HTTP GET
        // "test" es la ruta relativa al controlador: /api/documentos/test
        [HttpGet("test")]
        // Atributo que permite acceso sin autenticación
        [AllowAnonymous]
        // Método público que retorna IActionResult (resultado de acción HTTP)
        public IActionResult Test()
        {
            // Registrar en el log que se llamó al endpoint de test
            _logger.LogInformation("Test endpoint called");
            
            // Retornar respuesta HTTP 200 OK con un objeto JSON
            // Ok() es un método helper que crea un resultado 200
            return Ok(new
            {
                // Mensaje de confirmación
                message = "Documentos Controller is working",
                // Timestamp actual en UTC
                timestamp = DateTime.UtcNow,
                // Estado del servicio
                status = "OK",
                // Ruta donde se guardan los archivos
                uploadsPath = _uploadsPath
            });
        }

        /// <summary>
        /// Obtener todos los documentos
        /// GET: api/documentos
        /// </summary>
        /// <returns>Lista de todos los documentos</returns>
        // Atributo HTTP GET sin ruta adicional: /api/documentos
        [HttpGet]
        // Método asíncrono que retorna Task<IActionResult>
        public async Task<IActionResult> GetAll()
        {
            try
            {
                // Registrar en el log que se está obteniendo la lista de documentos
                _logger.LogInformation("Getting all documents");
                
                // Crear lista para almacenar los documentos
                var documentos = new List<object>();
                
                // Usar using para asegurar que la conexión se cierre automáticamente
                // MySqlConnection crea una conexión a la base de datos MySQL
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir la conexión a la base de datos de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Definir la consulta SQL para obtener todos los documentos
                    // SELECT * obtiene todas las columnas de la tabla Documento
                    var query = "SELECT * FROM Documento ORDER BY FechaCreacion DESC";
                    
                    // Crear comando SQL con la consulta y la conexión
                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Ejecutar la consulta y obtener un lector de datos de forma asíncrona
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            // Leer cada fila del resultado mientras haya datos
                            while (await reader.ReadAsync())
                            {
                                // Crear objeto anónimo con los datos del documento
                                // Mapear cada columna de la BD a una propiedad del objeto
                                var nombreOrdinal = reader.GetOrdinal("Nombre");
                                var tipoOrdinal = reader.GetOrdinal("Tipo");
                                var categoriaOrdinal = reader.GetOrdinal("Categoria");
                                var descripcionOrdinal = reader.GetOrdinal("Descripcion");
                                var rutaArchivoOrdinal = reader.GetOrdinal("RutaArchivo");
                                var tamanoFormateadoOrdinal = reader.GetOrdinal("TamanoFormateado");
                                var estadoOrdinal = reader.GetOrdinal("Estado");
                                var numeroVistasOrdinal = reader.GetOrdinal("NumeroVistas");
                                var numeroDescargasOrdinal = reader.GetOrdinal("NumeroDescargas");
                                
                                documentos.Add(new
                                {
                                    // Leer DocumentoID como int
                                    documentoID = reader.GetInt32(reader.GetOrdinal("DocumentoID")),
                                    // Leer Nombre como string
                                    nombre = reader.IsDBNull(nombreOrdinal) ? "" : reader.GetString(nombreOrdinal),
                                    // Leer Tipo como string
                                    tipo = reader.IsDBNull(tipoOrdinal) ? "" : reader.GetString(tipoOrdinal),
                                    // Leer Categoria como string
                                    categoria = reader.IsDBNull(categoriaOrdinal) ? "" : reader.GetString(categoriaOrdinal),
                                    // Leer Descripcion como string (puede ser null)
                                    descripcion = reader.IsDBNull(descripcionOrdinal) ? null : reader.GetString(descripcionOrdinal),
                                    // Leer RutaArchivo como string (puede ser null)
                                    rutaArchivo = reader.IsDBNull(rutaArchivoOrdinal) ? null : reader.GetString(rutaArchivoOrdinal),
                                    // Leer TamanoFormateado como string (puede ser null)
                                    tamanoFormateado = reader.IsDBNull(tamanoFormateadoOrdinal) ? null : reader.GetString(tamanoFormateadoOrdinal),
                                    // Leer Estado como string
                                    estado = reader.IsDBNull(estadoOrdinal) ? "draft" : reader.GetString(estadoOrdinal),
                                    // Leer FechaCreacion como DateTime
                                    fechaCreacion = reader.GetDateTime(reader.GetOrdinal("FechaCreacion")),
                                    // Leer NumeroVistas como int (puede ser null, usar 0 por defecto)
                                    numeroVistas = reader.IsDBNull(numeroVistasOrdinal) ? 0 : reader.GetInt32(numeroVistasOrdinal),
                                    // Leer NumeroDescargas como int (puede ser null, usar 0 por defecto)
                                    numeroDescargas = reader.IsDBNull(numeroDescargasOrdinal) ? 0 : reader.GetInt32(numeroDescargasOrdinal)
                                });
                            }
                        }
                    }
                }
                
                // Registrar en el log cuántos documentos se encontraron
                _logger.LogInformation($"Found {documentos.Count} documents");
                
                // Retornar respuesta HTTP 200 OK con la lista de documentos
                return Ok(documentos);
            }
            catch (Exception ex)
            {
                // Capturar cualquier excepción que ocurra
                // Registrar el error en el log con el mensaje y stack trace
                _logger.LogError(ex, "Error getting documents");
                
                // Retornar respuesta HTTP 500 Internal Server Error con mensaje de error
                // StatusCode() permite especificar el código de estado HTTP
                return StatusCode(500, new { message = "Error al obtener documentos", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener un documento por ID
        /// GET: api/documentos/{id}
        /// </summary>
        /// <param name="id">ID del documento a buscar</param>
        /// <returns>Documento encontrado o 404 si no existe</returns>
        // Atributo HTTP GET con parámetro de ruta {id}
        // {id} es un placeholder que se reemplaza con el valor real
        [HttpGet("{id}")]
        // Método asíncrono que recibe el id como parámetro
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                // Registrar en el log que se está buscando un documento específico
                _logger.LogInformation($"Getting document with ID: {id}");
                
                // Variable para almacenar el documento encontrado
                object documento = null;
                
                // Crear conexión a la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir conexión de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Consulta SQL con parámetro para evitar SQL Injection
                    // @DocumentoID es un parámetro que se reemplazará de forma segura
                    var query = "SELECT * FROM Documento WHERE DocumentoID = @DocumentoID";
                    
                    // Crear comando SQL
                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Agregar parámetro al comando
                        // AddWithValue agrega el parámetro con su valor
                        command.Parameters.AddWithValue("@DocumentoID", id);
                        
                        // Ejecutar consulta y obtener lector de datos
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            // Verificar si se encontró un registro
                            // ReadAsync() retorna true si hay datos
                            if (await reader.ReadAsync())
                            {
                                // Obtener índices de columnas
                                var descripcionOrdinal = reader.GetOrdinal("Descripcion");
                                var rutaArchivoOrdinal = reader.GetOrdinal("RutaArchivo");
                                var tamanoFormateadoOrdinal = reader.GetOrdinal("TamanoFormateado");
                                
                                // Crear objeto con los datos del documento
                                documento = new
                                {
                                    documentoID = reader.GetInt32(reader.GetOrdinal("DocumentoID")),
                                    nombre = reader.GetString(reader.GetOrdinal("Nombre")),
                                    tipo = reader.GetString(reader.GetOrdinal("Tipo")),
                                    categoria = reader.GetString(reader.GetOrdinal("Categoria")),
                                    descripcion = reader.IsDBNull(descripcionOrdinal) ? null : reader.GetString(descripcionOrdinal),
                                    rutaArchivo = reader.IsDBNull(rutaArchivoOrdinal) ? null : reader.GetString(rutaArchivoOrdinal),
                                    tamanoFormateado = reader.IsDBNull(tamanoFormateadoOrdinal) ? null : reader.GetString(tamanoFormateadoOrdinal),
                                    estado = reader.GetString(reader.GetOrdinal("Estado")),
                                    fechaCreacion = reader.GetDateTime(reader.GetOrdinal("FechaCreacion"))
                                };
                            }
                        }
                    }
                }
                
                // Verificar si se encontró el documento
                if (documento == null)
                {
                    // Registrar en el log que no se encontró el documento
                    _logger.LogWarning($"Document with ID {id} not found");
                    // Retornar respuesta HTTP 404 Not Found
                    return NotFound(new { message = $"Documento con ID {id} no encontrado" });
                }
                
                // Retornar respuesta HTTP 200 OK con el documento
                return Ok(documento);
            }
            catch (Exception ex)
            {
                // Capturar y registrar cualquier error
                _logger.LogError(ex, $"Error getting document with ID: {id}");
                // Retornar respuesta HTTP 500 con mensaje de error
                return StatusCode(500, new { message = "Error al obtener documento", error = ex.Message });
            }
        }

        /// <summary>
        /// Crear un nuevo documento (sin archivo)
        /// POST: api/documentos
        /// </summary>
        /// <param name="documento">Datos del documento a crear</param>
        /// <returns>Documento creado con su ID</returns>
        // Atributo HTTP POST para crear recursos
        [HttpPost]
        // Método asíncrono que recibe un objeto dinámico desde el body de la petición
        // [FromBody] indica que los datos vienen en el cuerpo de la petición HTTP
        public async Task<IActionResult> Create([FromBody] dynamic documento)
        {
            try
            {
                // Registrar en el log que se está creando un documento
                _logger.LogInformation("Creating new document");
                
                // Variable para almacenar el ID del documento creado
                int documentoId = 0;
                
                // Crear conexión a la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir conexión de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Consulta SQL INSERT para crear un nuevo registro
                    // Los valores se pasan como parámetros para evitar SQL Injection
                    var query = @"INSERT INTO Documento 
                        (Nombre, Tipo, Categoria, Descripcion, Estado, RutaArchivo, TamanoFormateado, FechaCreacion) 
                        VALUES 
                        (@Nombre, @Tipo, @Categoria, @Descripcion, @Estado, @RutaArchivo, @TamanoFormateado, @FechaCreacion);
                        SELECT LAST_INSERT_ID();";
                    
                    // Crear comando SQL
                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Agregar parámetros al comando
                        // Convertir el objeto dinámico a string usando ToString()
                        // ?? proporciona un valor por defecto si es null
                        command.Parameters.AddWithValue("@Nombre", documento.nombre?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Tipo", documento.tipo?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Categoria", documento.categoria?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Descripcion", documento.descripcion?.ToString());
                        command.Parameters.AddWithValue("@Estado", documento.estado?.ToString() ?? "draft");
                        command.Parameters.AddWithValue("@RutaArchivo", documento.rutaArchivo?.ToString());
                        command.Parameters.AddWithValue("@TamanoFormateado", documento.tamanoFormateado?.ToString() ?? "0 KB");
                        // DateTime.UtcNow obtiene la fecha y hora actual en UTC
                        command.Parameters.AddWithValue("@FechaCreacion", DateTime.UtcNow);
                        
                        // Ejecutar la consulta y obtener el ID generado
                        // ExecuteScalarAsync() ejecuta la consulta y retorna el primer valor de la primera fila
                        // LAST_INSERT_ID() retorna el ID del último registro insertado
                        // Convert.ToInt32() convierte el resultado a entero
                        documentoId = Convert.ToInt32(await command.ExecuteScalarAsync());
                    }
                }
                
                // Registrar en el log que se creó el documento exitosamente
                _logger.LogInformation($"Document created with ID: {documentoId}");
                
                // Crear objeto con los datos del documento creado
                var resultado = new
                {
                    documentoID = documentoId,
                    nombre = documento.nombre?.ToString(),
                    tipo = documento.tipo?.ToString(),
                    categoria = documento.categoria?.ToString(),
                    descripcion = documento.descripcion?.ToString(),
                    estado = documento.estado?.ToString() ?? "draft",
                    rutaArchivo = documento.rutaArchivo?.ToString(),
                    tamanoFormateado = documento.tamanoFormateado?.ToString() ?? "0 KB",
                    fechaCreacion = DateTime.UtcNow
                };
                
                // Retornar respuesta HTTP 201 Created con el documento creado
                // CreatedAtAction() crea una respuesta 201 con la ubicación del recurso creado
                // nameof(GetById) obtiene el nombre del método GetById como string
                // new { id = documentoId } son los parámetros de ruta para GetById
                return CreatedAtAction(nameof(GetById), new { id = documentoId }, resultado);
            }
            catch (Exception ex)
            {
                // Capturar y registrar cualquier error
                _logger.LogError(ex, "Error creating document");
                // Retornar respuesta HTTP 500 con mensaje de error
                return StatusCode(500, new { message = "Error al crear documento", error = ex.Message });
            }
        }

        /// <summary>
        /// Subir archivo de documento
        /// POST: api/documentos/upload
        /// </summary>
        /// <param name="file">Archivo a subir</param>
        /// <param name="nombre">Nombre del documento</param>
        /// <param name="categoria">Categoría del documento</param>
        /// <param name="estado">Estado del documento</param>
        /// <param name="descripcion">Descripción del documento</param>
        /// <returns>Documento creado con la ruta del archivo</returns>
        // Atributo HTTP POST con ruta adicional "upload"
        [HttpPost("upload")]
        // Método asíncrono que recibe datos de un formulario multipart/form-data
        // IFormFile es la interfaz para archivos subidos
        // [FromForm] indica que los datos vienen de un formulario
        public async Task<IActionResult> Upload(
            [FromForm] IFormFile file,
            [FromForm] string? nombre = null,
            [FromForm] string? categoria = null,
            [FromForm] string? estado = null,
            [FromForm] string? descripcion = null)
        {
            try
            {
                // Registrar en el log que se está subiendo un archivo
                _logger.LogInformation($"Uploading file: {file?.FileName}");
                _logger.LogInformation($"Parameters - Nombre: {nombre}, Categoria: {categoria}, Estado: {estado}, Descripcion: {descripcion}");
                
                // Validar que se haya enviado un archivo
                if (file == null || file.Length == 0)
                {
                    // Retornar respuesta HTTP 400 Bad Request si no hay archivo
                    return BadRequest(new { message = "No se ha enviado ningún archivo" });
                }
                
                // Generar nombre único para el archivo
                // Guid.NewGuid() genera un identificador único global
                // Path.GetExtension() obtiene la extensión del archivo original
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                // Combinar la ruta de uploads con el nombre del archivo
                var filePath = Path.Combine(_uploadsPath, fileName);
                
                // Guardar el archivo en el sistema de archivos
                // using asegura que el stream se cierre correctamente
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    // CopyToAsync() copia el contenido del archivo subido al stream de forma asíncrona
                    await file.CopyToAsync(stream);
                }
                
                // Registrar en el log que el archivo se guardó exitosamente
                _logger.LogInformation($"File saved: {filePath}");
                
                // Detectar el tipo de documento según la extensión
                var extension = Path.GetExtension(file.FileName).ToLower();
                string tipo = "Archivo"; // Tipo por defecto
                // Switch expression para mapear extensiones a tipos
                tipo = extension switch
                {
                    ".pdf" => "PDF",
                    ".doc" or ".docx" => "Word",
                    ".xls" or ".xlsx" => "Excel",
                    ".png" or ".jpg" or ".jpeg" => "Image",
                    _ => "Archivo" // Caso por defecto
                };
                
                // Formatear el tamaño del archivo
                // file.Length contiene el tamaño en bytes
                var tamanoFormateado = FormatFileSize(file.Length);
                
                // Crear la URL relativa del archivo
                // Esta URL se usará para acceder al archivo desde el frontend
                var rutaArchivo = $"/uploads/documentos/{fileName}";
                
                // Variable para almacenar el ID del documento creado
                int documentoId = 0;
                
                // Crear conexión a la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir conexión de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Consulta SQL INSERT para guardar los metadatos del documento
                    var query = @"INSERT INTO Documento 
                        (Nombre, Tipo, Categoria, Descripcion, Estado, NombreArchivo, RutaArchivo, 
                         TamanoBytes, TamanoFormateado, Extension, FechaCreacion) 
                        VALUES 
                        (@Nombre, @Tipo, @Categoria, @Descripcion, @Estado, @NombreArchivo, @RutaArchivo, 
                         @TamanoBytes, @TamanoFormateado, @Extension, @FechaCreacion);
                        SELECT LAST_INSERT_ID();";
                    
                    // Crear comando SQL
                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Agregar todos los parámetros al comando
                        command.Parameters.AddWithValue("@Nombre", nombre ?? file.FileName);
                        command.Parameters.AddWithValue("@Tipo", tipo);
                        command.Parameters.AddWithValue("@Categoria", categoria ?? "otros");
                        command.Parameters.AddWithValue("@Descripcion", descripcion);
                        command.Parameters.AddWithValue("@Estado", estado ?? "draft");
                        command.Parameters.AddWithValue("@NombreArchivo", file.FileName);
                        command.Parameters.AddWithValue("@RutaArchivo", rutaArchivo);
                        command.Parameters.AddWithValue("@TamanoBytes", file.Length);
                        command.Parameters.AddWithValue("@TamanoFormateado", tamanoFormateado);
                        command.Parameters.AddWithValue("@Extension", extension.TrimStart('.'));
                        command.Parameters.AddWithValue("@FechaCreacion", DateTime.UtcNow);
                        
                        _logger.LogInformation("Executing SQL INSERT query...");
                        
                        // Ejecutar la consulta y obtener el ID generado
                        var result = await command.ExecuteScalarAsync();
                        _logger.LogInformation($"SQL query executed. Result: {result}");
                        
                        documentoId = Convert.ToInt32(result);
                        _logger.LogInformation($"Document ID converted: {documentoId}");
                    }
                }
                
                _logger.LogInformation($"Database connection closed. Document ID: {documentoId}");
                
                // Registrar en el log que el documento se creó exitosamente
                _logger.LogInformation($"Document created with ID: {documentoId}");
                
                // Crear objeto con los datos del documento creado
                var resultado = new
                {
                    documentoID = documentoId,
                    nombre = nombre ?? file.FileName,
                    tipo = tipo,
                    categoria = categoria ?? "otros",
                    descripcion = descripcion,
                    estado = estado ?? "draft",
                    nombreArchivo = file.FileName,
                    rutaArchivo = rutaArchivo,
                    tamanoBytes = file.Length,
                    tamanoFormateado = tamanoFormateado,
                    extension = extension.TrimStart('.'),
                    fechaCreacion = DateTime.UtcNow
                };
                
                // Retornar respuesta HTTP 201 Created con el documento creado
                return CreatedAtAction(nameof(GetById), new { id = documentoId }, resultado);
            }
            catch (Exception ex)
            {
                // Capturar y registrar cualquier error
                _logger.LogError(ex, "Error uploading file");
                // Retornar respuesta HTTP 500 con mensaje de error
                return StatusCode(500, new { message = "Error al subir archivo", error = ex.Message });
            }
        }

        /// <summary>
        /// Actualizar un documento existente
        /// PUT: api/documentos/{id}
        /// </summary>
        /// <param name="id">ID del documento a actualizar</param>
        /// <param name="documento">Datos actualizados del documento</param>
        /// <returns>Documento actualizado</returns>
        // Atributo HTTP PUT para actualizar recursos
        [HttpPut("{id}")]
        // Método asíncrono que recibe el ID por ruta y los datos por body
        public async Task<IActionResult> Update(int id, [FromBody] dynamic documento)
        {
            try
            {
                // Registrar en el log que se está actualizando un documento
                _logger.LogInformation($"Updating document with ID: {id}");
                
                // Crear conexión a la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir conexión de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Consulta SQL UPDATE para modificar el registro
                    // SET actualiza los campos especificados
                    // WHERE filtra por el ID del documento
                    var query = @"UPDATE Documento SET 
                        Nombre = @Nombre,
                        Tipo = @Tipo,
                        Categoria = @Categoria,
                        Descripcion = @Descripcion,
                        Estado = @Estado,
                        RutaArchivo = @RutaArchivo,
                        FechaModificacion = @FechaModificacion
                        WHERE DocumentoID = @DocumentoID";
                    
                    // Crear comando SQL
                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Agregar parámetros al comando
                        command.Parameters.AddWithValue("@DocumentoID", id);
                        command.Parameters.AddWithValue("@Nombre", documento.nombre?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Tipo", documento.tipo?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Categoria", documento.categoria?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Descripcion", documento.descripcion?.ToString());
                        command.Parameters.AddWithValue("@Estado", documento.estado?.ToString() ?? "draft");
                        command.Parameters.AddWithValue("@RutaArchivo", documento.rutaArchivo?.ToString());
                        command.Parameters.AddWithValue("@FechaModificacion", DateTime.UtcNow);
                        
                        // Ejecutar la consulta UPDATE
                        // ExecuteNonQueryAsync() ejecuta la consulta y retorna el número de filas afectadas
                        var rowsAffected = await command.ExecuteNonQueryAsync();
                        
                        // Verificar si se actualizó algún registro
                        if (rowsAffected == 0)
                        {
                            // Si no se actualizó ningún registro, el documento no existe
                            _logger.LogWarning($"Document with ID {id} not found for update");
                            return NotFound(new { message = $"Documento con ID {id} no encontrado" });
                        }
                    }
                }
                
                // Registrar en el log que se actualizó exitosamente
                _logger.LogInformation($"Document with ID {id} updated successfully");
                
                // Obtener el documento actualizado llamando al método GetById
                // Esto asegura que retornamos los datos actuales de la BD
                return await GetById(id);
            }
            catch (Exception ex)
            {
                // Capturar y registrar cualquier error
                _logger.LogError(ex, $"Error updating document with ID: {id}");
                // Retornar respuesta HTTP 500 con mensaje de error
                return StatusCode(500, new { message = "Error al actualizar documento", error = ex.Message });
            }
        }

        /// <summary>
        /// Eliminar un documento
        /// DELETE: api/documentos/{id}
        /// </summary>
        /// <param name="id">ID del documento a eliminar</param>
        /// <returns>Confirmación de eliminación</returns>
        // Atributo HTTP DELETE para eliminar recursos
        [HttpDelete("{id}")]
        // Método asíncrono que recibe el ID por ruta
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Registrar en el log que se está eliminando un documento
                _logger.LogInformation($"Deleting document with ID: {id}");
                
                // Variable para almacenar la ruta del archivo a eliminar
                string rutaArchivo = null;
                
                // Crear conexión a la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir conexión de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Primero obtener la ruta del archivo para eliminarlo del sistema de archivos
                    var selectQuery = "SELECT RutaArchivo FROM Documento WHERE DocumentoID = @DocumentoID";
                    using (var selectCommand = new MySqlCommand(selectQuery, connection))
                    {
                        // Agregar parámetro al comando
                        selectCommand.Parameters.AddWithValue("@DocumentoID", id);
                        // Ejecutar consulta y obtener la ruta del archivo
                        rutaArchivo = await selectCommand.ExecuteScalarAsync() as string;
                    }
                    
                    // Consulta SQL DELETE para eliminar el registro
                    var deleteQuery = "DELETE FROM Documento WHERE DocumentoID = @DocumentoID";
                    using (var deleteCommand = new MySqlCommand(deleteQuery, connection))
                    {
                        // Agregar parámetro al comando
                        deleteCommand.Parameters.AddWithValue("@DocumentoID", id);
                        // Ejecutar la consulta DELETE
                        var rowsAffected = await deleteCommand.ExecuteNonQueryAsync();
                        
                        // Verificar si se eliminó algún registro
                        if (rowsAffected == 0)
                        {
                            // Si no se eliminó ningún registro, el documento no existe
                            _logger.LogWarning($"Document with ID {id} not found for deletion");
                            return NotFound(new { message = $"Documento con ID {id} no encontrado" });
                        }
                    }
                }
                
                // Si el documento tenía un archivo asociado, eliminarlo del sistema de archivos
                if (!string.IsNullOrEmpty(rutaArchivo))
                {
                    // Obtener el nombre del archivo desde la ruta
                    var fileName = Path.GetFileName(rutaArchivo);
                    // Construir la ruta completa del archivo
                    var fullPath = Path.Combine(_uploadsPath, fileName);
                    
                    // Verificar si el archivo existe antes de intentar eliminarlo
                    if (System.IO.File.Exists(fullPath))
                    {
                        // Eliminar el archivo del sistema de archivos
                        System.IO.File.Delete(fullPath);
                        _logger.LogInformation($"File deleted: {fullPath}");
                    }
                }
                
                // Registrar en el log que se eliminó exitosamente
                _logger.LogInformation($"Document with ID {id} deleted successfully");
                
                // Retornar respuesta HTTP 200 OK con mensaje de confirmación
                return Ok(new { message = "Documento eliminado correctamente" });
            }
            catch (Exception ex)
            {
                // Capturar y registrar cualquier error
                _logger.LogError(ex, $"Error deleting document with ID: {id}");
                // Retornar respuesta HTTP 500 con mensaje de error
                return StatusCode(500, new { message = "Error al eliminar documento", error = ex.Message });
            }
        }

        /// <summary>
        /// Incrementar contador de vistas de un documento
        /// POST: api/documentos/{id}/view
        /// </summary>
        /// <param name="id">ID del documento</param>
        /// <returns>Confirmación de actualización</returns>
        // Atributo HTTP POST con ruta adicional "{id}/view"
        [HttpPost("{id}/view")]
        // Método asíncrono que recibe el ID por ruta
        public async Task<IActionResult> IncrementViews(int id)
        {
            try
            {
                // Registrar en el log que se está incrementando el contador de vistas
                _logger.LogInformation($"Incrementing views for document ID: {id}");
                
                // Crear conexión a la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir conexión de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Consulta SQL UPDATE para incrementar el contador
                    // NumeroVistas = NumeroVistas + 1 incrementa el valor actual en 1
                    // FechaUltimoAcceso se actualiza con la fecha actual
                    var query = @"UPDATE Documento SET 
                        NumeroVistas = NumeroVistas + 1,
                        FechaUltimoAcceso = @FechaUltimoAcceso
                        WHERE DocumentoID = @DocumentoID";
                    
                    // Crear comando SQL
                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Agregar parámetros al comando
                        command.Parameters.AddWithValue("@DocumentoID", id);
                        command.Parameters.AddWithValue("@FechaUltimoAcceso", DateTime.UtcNow);
                        
                        // Ejecutar la consulta UPDATE
                        await command.ExecuteNonQueryAsync();
                    }
                }
                
                // Registrar en el log que se incrementó exitosamente
                _logger.LogInformation($"Views incremented for document ID: {id}");
                
                // Retornar respuesta HTTP 200 OK con mensaje de confirmación
                return Ok(new { message = "Vista registrada correctamente" });
            }
            catch (Exception ex)
            {
                // Capturar y registrar cualquier error
                _logger.LogError(ex, $"Error incrementing views for document ID: {id}");
                // Retornar respuesta HTTP 500 con mensaje de error
                return StatusCode(500, new { message = "Error al registrar vista", error = ex.Message });
            }
        }

        /// <summary>
        /// Incrementar contador de descargas de un documento
        /// POST: api/documentos/{id}/download
        /// </summary>
        /// <param name="id">ID del documento</param>
        /// <returns>Confirmación de actualización</returns>
        // Atributo HTTP POST con ruta adicional "{id}/download"
        [HttpPost("{id}/download")]
        // Método asíncrono que recibe el ID por ruta
        public async Task<IActionResult> IncrementDownloads(int id)
        {
            try
            {
                // Registrar en el log que se está incrementando el contador de descargas
                _logger.LogInformation($"Incrementing downloads for document ID: {id}");
                
                // Crear conexión a la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Abrir conexión de forma asíncrona
                    await connection.OpenAsync();
                    
                    // Consulta SQL UPDATE para incrementar el contador
                    // NumeroDescargas = NumeroDescargas + 1 incrementa el valor actual en 1
                    // FechaUltimoAcceso se actualiza con la fecha actual
                    var query = @"UPDATE Documento SET 
                        NumeroDescargas = NumeroDescargas + 1,
                        FechaUltimoAcceso = @FechaUltimoAcceso
                        WHERE DocumentoID = @DocumentoID";
                    
                    // Crear comando SQL
                    using (var command = new MySqlCommand(query, connection))
                    {
                        // Agregar parámetros al comando
                        command.Parameters.AddWithValue("@DocumentoID", id);
                        command.Parameters.AddWithValue("@FechaUltimoAcceso", DateTime.UtcNow);
                        
                        // Ejecutar la consulta UPDATE
                        await command.ExecuteNonQueryAsync();
                    }
                }
                
                // Registrar en el log que se incrementó exitosamente
                _logger.LogInformation($"Downloads incremented for document ID: {id}");
                
                // Retornar respuesta HTTP 200 OK con mensaje de confirmación
                return Ok(new { message = "Descarga registrada correctamente" });
            }
            catch (Exception ex)
            {
                // Capturar y registrar cualquier error
                _logger.LogError(ex, $"Error incrementing downloads for document ID: {id}");
                // Retornar respuesta HTTP 500 con mensaje de error
                return StatusCode(500, new { message = "Error al registrar descarga", error = ex.Message });
            }
        }



        /// <summary>
        /// Convertir documento a PDF para vista previa
        /// GET: api/documentos/{id}/pdf
        /// </summary>
        /// <param name="id">ID del documento</param>
        /// <returns>Archivo PDF para visualización</returns>
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetPdfPreview(int id)
        {
            try
            {
                _logger.LogInformation($"Generating PDF preview for document ID: {id}");
                
                // Variables para almacenar los datos del documento
                string? rutaArchivo = null;
                string? extension = null;
                string? nombreArchivo = null;
                
                // Obtener información del documento desde la base de datos
                using (var connection = new MySqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    var query = "SELECT RutaArchivo, Extension, NombreArchivo FROM Documento WHERE DocumentoID = @DocumentoID";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@DocumentoID", id);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                rutaArchivo = reader.IsDBNull(0) ? null : reader.GetString(0);
                                extension = reader.IsDBNull(1) ? null : reader.GetString(1);
                                nombreArchivo = reader.IsDBNull(2) ? null : reader.GetString(2);
                            }
                        }
                    }
                }
                
                // Verificar que el documento existe y tiene archivo
                if (string.IsNullOrEmpty(rutaArchivo))
                {
                    _logger.LogWarning($"Document {id} not found or has no file");
                    return NotFound(new { message = "Documento no encontrado o sin archivo" });
                }
                
                // Construir la ruta completa del archivo
                var fileName = Path.GetFileName(rutaArchivo);
                var filePath = Path.Combine(_uploadsPath, fileName);
                
                // Verificar que el archivo existe en el sistema de archivos
                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning($"File not found: {filePath}");
                    return NotFound(new { message = "Archivo no encontrado en el servidor" });
                }
                
                // Si ya es PDF, devolverlo directamente
                if (extension?.ToLower() == "pdf")
                {
                    _logger.LogInformation($"Document {id} is already PDF, returning directly");
                    var pdfBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                    
                    // Configurar header para visualización en navegador (inline)
                    Response.Headers["Content-Disposition"] = "inline";
                    return File(pdfBytes, "application/pdf");
                }
                
                // Convertir a PDF según el tipo de archivo usando servicio sin marca de agua
                byte[]? pdfContent = null;
                
                // Excel files (.xlsx, .xls)
                if (extension?.ToLower() == "xlsx" || extension?.ToLower() == "xls")
                {
                    _logger.LogInformation($"Converting Excel file to PDF (No Watermark): {filePath}");
                    pdfContent = await _pdfConversionService.ConvertExcelToPdfAsync(filePath);
                }
                // Word files (.docx, .doc)
                else if (extension?.ToLower() == "docx" || extension?.ToLower() == "doc")
                {
                    _logger.LogInformation($"Converting Word file to PDF (No Watermark): {filePath}");
                    pdfContent = await _pdfConversionService.ConvertWordToPdfAsync(filePath);
                }
                else
                {
                    _logger.LogWarning($"Unsupported file type for PDF conversion: {extension}");
                    return BadRequest(new { message = $"Tipo de archivo no soportado para conversión a PDF: {extension}" });
                }
                
                if (pdfContent == null || pdfContent.Length == 0)
                {
                    _logger.LogError($"Failed to convert document {id} to PDF");
                    return StatusCode(500, new { message = "Error al convertir el documento a PDF" });
                }
                
                _logger.LogInformation($"Successfully converted document {id} to PDF ({pdfContent.Length} bytes)");
                
                // Configurar header para visualización en navegador (inline)
                Response.Headers["Content-Disposition"] = "inline";
                
                // Retornar el PDF para visualización en navegador
                return File(pdfContent, "application/pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating PDF preview for document {id}");
                return StatusCode(500, new { message = "Error al generar vista previa PDF", error = ex.Message });
            }
        }

        // ===== MÉTODOS AUXILIARES PRIVADOS =====

        /// <summary>
        /// Formatear tamaño de archivo en bytes a formato legible
        /// </summary>
        /// <param name="bytes">Tamaño en bytes</param>
        /// <returns>Tamaño formateado (ej: "2.5 MB")</returns>
        // Método privado que recibe el tamaño en bytes y retorna un string formateado
        private string FormatFileSize(long bytes)
        {
            // Array con las unidades de medida
            string[] sizes = { "Bytes", "KB", "MB", "GB", "TB" };
            // Variable para almacenar el tamaño calculado
            double len = bytes;
            // Variable para el índice de la unidad
            int order = 0;
            
            // Dividir entre 1024 hasta que el tamaño sea menor a 1024
            // Esto determina la unidad apropiada (KB, MB, GB, etc.)
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++; // Incrementar el índice de la unidad
                len = len / 1024; // Dividir el tamaño entre 1024
            }
            
            // Formatear el resultado con 2 decimales y la unidad correspondiente
            // String.Format formatea el string según el patrón especificado
            // {0:0.##} formatea el número con hasta 2 decimales
            return String.Format("{0:0.##} {1}", len, sizes[order]);
        }
    }
}
// Fin del archivo DocumentosController.cs

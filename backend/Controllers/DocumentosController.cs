




using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Http;

using System.IO;

using System.Threading.Tasks;

using System.Collections.Generic;

using System.Linq;

using MySql.Data.MySqlClient;

using Microsoft.Extensions.Configuration;

using FlexoAPP.API.Services;


namespace FlexoAPP.API.Controllers
{






    [ApiController]

    [Route("api/documentos")]

    public class DocumentosController : ControllerBase
    {



        private readonly ILogger<DocumentosController> _logger;

        private readonly IConfiguration _configuration;

        private readonly string _connectionString;

        private readonly string _uploadsPath;

        private readonly IPdfConversionService _pdfConversionService;









        public DocumentosController(
            ILogger<DocumentosController> logger,
            IConfiguration configuration,
            IPdfConversionService pdfConversionService)
        {

            _logger = logger;

            _configuration = configuration;

            _pdfConversionService = pdfConversionService;


            _connectionString = _configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found");


            _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "documentos");



            if (!Directory.Exists(_uploadsPath))
            {

                Directory.CreateDirectory(_uploadsPath);
            }
        }










        [HttpGet("test")]

        [AllowAnonymous]

        public IActionResult Test()
        {

            _logger.LogDebug("Test endpoint called");



            return Ok(new
            {

                message = "Documentos Controller is working",

                timestamp = DateTime.UtcNow,

                status = "OK",

                uploadsPath = _uploadsPath
            });
        }







        [HttpGet]

        public async Task<IActionResult> GetAll()
        {
            try
            {

                _logger.LogDebug("Getting all documents");


                var documentos = new List<object>();



                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();



                    var query = "SELECT * FROM Documento ORDER BY FechaCreacion DESC";


                    using (var command = new MySqlCommand(query, connection))
                    {

                        using (var reader = await command.ExecuteReaderAsync())
                        {

                            while (await reader.ReadAsync())
                            {


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

                                    documentoID = reader.GetInt32(reader.GetOrdinal("DocumentoID")),

                                    nombre = reader.IsDBNull(nombreOrdinal) ? "" : reader.GetString(nombreOrdinal),

                                    tipo = reader.IsDBNull(tipoOrdinal) ? "" : reader.GetString(tipoOrdinal),

                                    categoria = reader.IsDBNull(categoriaOrdinal) ? "" : reader.GetString(categoriaOrdinal),

                                    descripcion = reader.IsDBNull(descripcionOrdinal) ? null : reader.GetString(descripcionOrdinal),

                                    rutaArchivo = reader.IsDBNull(rutaArchivoOrdinal) ? null : reader.GetString(rutaArchivoOrdinal),

                                    tamanoFormateado = reader.IsDBNull(tamanoFormateadoOrdinal) ? null : reader.GetString(tamanoFormateadoOrdinal),

                                    estado = reader.IsDBNull(estadoOrdinal) ? "draft" : reader.GetString(estadoOrdinal),

                                    fechaCreacion = reader.GetDateTime(reader.GetOrdinal("FechaCreacion")),

                                    numeroVistas = reader.IsDBNull(numeroVistasOrdinal) ? 0 : reader.GetInt32(numeroVistasOrdinal),

                                    numeroDescargas = reader.IsDBNull(numeroDescargasOrdinal) ? 0 : reader.GetInt32(numeroDescargasOrdinal)
                                });
                            }
                        }
                    }
                }


                _logger.LogDebug($"Found {documentos.Count} documents");


                return Ok(documentos);
            }
            catch (Exception ex)
            {


                _logger.LogError(ex, "Error getting documents");



                return StatusCode(500, new { message = "Error al obtener documentos", error = ex.Message });
            }
        }









        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)
        {
            try
            {

                _logger.LogDebug($"Getting document with ID: {id}");


                object? documento = null;


                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();



                    var query = "SELECT * FROM Documento WHERE DocumentoID = @DocumentoID";


                    using (var command = new MySqlCommand(query, connection))
                    {


                        command.Parameters.AddWithValue("@DocumentoID", id);


                        using (var reader = await command.ExecuteReaderAsync())
                        {


                            if (await reader.ReadAsync())
                            {

                                var descripcionOrdinal = reader.GetOrdinal("Descripcion");
                                var rutaArchivoOrdinal = reader.GetOrdinal("RutaArchivo");
                                var tamanoFormateadoOrdinal = reader.GetOrdinal("TamanoFormateado");


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


                if (documento == null)
                {

                    _logger.LogWarning($"Document with ID {id} not found");

                    return NotFound(new { message = $"Documento con ID {id} no encontrado" });
                }


                return Ok(documento);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error getting document with ID: {id}");

                return StatusCode(500, new { message = "Error al obtener documento", error = ex.Message });
            }
        }








        [HttpPost]


        public async Task<IActionResult> Create([FromBody] dynamic documento)
        {
            try
            {

                _logger.LogDebug("Creating new document");


                int documentoId = 0;


                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();



                    var query = @"INSERT INTO Documento
                        (Nombre, Tipo, Categoria, Descripcion, Estado, RutaArchivo, TamanoFormateado, FechaCreacion)
                        VALUES
                        (@Nombre, @Tipo, @Categoria, @Descripcion, @Estado, @RutaArchivo, @TamanoFormateado, @FechaCreacion);
                        SELECT LAST_INSERT_ID();";


                    using (var command = new MySqlCommand(query, connection))
                    {



                        command.Parameters.AddWithValue("@Nombre", documento.nombre?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Tipo", documento.tipo?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Categoria", documento.categoria?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Descripcion", documento.descripcion?.ToString());
                        command.Parameters.AddWithValue("@Estado", documento.estado?.ToString() ?? "draft");
                        command.Parameters.AddWithValue("@RutaArchivo", documento.rutaArchivo?.ToString());
                        command.Parameters.AddWithValue("@TamanoFormateado", documento.tamanoFormateado?.ToString() ?? "0 KB");

                        command.Parameters.AddWithValue("@FechaCreacion", DateTime.UtcNow);





                        documentoId = Convert.ToInt32(await command.ExecuteScalarAsync());
                    }
                }


                _logger.LogDebug($"Document created with ID: {documentoId}");


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





                return CreatedAtAction(nameof(GetById), new { id = documentoId }, resultado);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "Error creating document");

                return StatusCode(500, new { message = "Error al crear documento", error = ex.Message });
            }
        }












        [HttpPost("upload")]



        public async Task<IActionResult> Upload(
            [FromForm] IFormFile file,
            [FromForm] string? nombre = null,
            [FromForm] string? categoria = null,
            [FromForm] string? estado = null,
            [FromForm] string? descripcion = null)
        {
            try
            {

                _logger.LogDebug($"Uploading file: {file?.FileName}");
                _logger.LogDebug($"Parameters - Nombre: {nombre}, Categoria: {categoria}, Estado: {estado}, Descripcion: {descripcion}");


                if (file == null || file.Length == 0)
                {

                    return BadRequest(new { message = "No se ha enviado ningún archivo" });
                }




                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

                var filePath = Path.Combine(_uploadsPath, fileName);



                using (var stream = new FileStream(filePath, FileMode.Create))
                {

                    await file.CopyToAsync(stream);
                }


                _logger.LogDebug($"File saved: {filePath}");


                var extension = Path.GetExtension(file.FileName).ToLower();
                string tipo = "Archivo";

                tipo = extension switch
                {
                    ".pdf" => "PDF",
                    ".doc" or ".docx" => "Word",
                    ".xls" or ".xlsx" => "Excel",
                    ".png" or ".jpg" or ".jpeg" => "Image",
                    _ => "Archivo"
                };



                var tamanoFormateado = FormatFileSize(file.Length);



                var rutaArchivo = $"/uploads/documentos/{fileName}";


                int documentoId = 0;


                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();


                    var query = @"INSERT INTO Documento
                        (Nombre, Tipo, Categoria, Descripcion, Estado, NombreArchivo, RutaArchivo,
                         TamanoBytes, TamanoFormateado, Extension, EsPublico, NivelAcceso, FechaCreacion)
                        VALUES
                        (@Nombre, @Tipo, @Categoria, @Descripcion, @Estado, @NombreArchivo, @RutaArchivo,
                         @TamanoBytes, @TamanoFormateado, @Extension, @EsPublico, @NivelAcceso, @FechaCreacion);
                        SELECT LAST_INSERT_ID();";


                    using (var command = new MySqlCommand(query, connection))
                    {

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
                        command.Parameters.AddWithValue("@EsPublico", 0);
                        command.Parameters.AddWithValue("@NivelAcceso", 1);
                        command.Parameters.AddWithValue("@FechaCreacion", DateTime.UtcNow);

                        _logger.LogDebug("Executing SQL INSERT query...");


                        var result = await command.ExecuteScalarAsync();
                        _logger.LogDebug($"SQL query executed. Result: {result}");

                        documentoId = Convert.ToInt32(result);
                        _logger.LogDebug($"Document ID converted: {documentoId}");
                    }
                }

                _logger.LogDebug($"Database connection closed. Document ID: {documentoId}");


                _logger.LogDebug($"Document created with ID: {documentoId}");


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


                return CreatedAtAction(nameof(GetById), new { id = documentoId }, resultado);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "Error uploading file");

                return StatusCode(500, new { message = "Error al subir archivo", error = ex.Message });
            }
        }









        [HttpPut("{id}")]

        public async Task<IActionResult> Update(int id, [FromBody] dynamic documento)
        {
            try
            {

                _logger.LogDebug($"Updating document with ID: {id}");


                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();




                    var query = @"UPDATE Documento SET
                        Nombre = @Nombre,
                        Tipo = @Tipo,
                        Categoria = @Categoria,
                        Descripcion = @Descripcion,
                        Estado = @Estado,
                        RutaArchivo = @RutaArchivo,
                        FechaModificacion = @FechaModificacion
                        WHERE DocumentoID = @DocumentoID";


                    using (var command = new MySqlCommand(query, connection))
                    {

                        command.Parameters.AddWithValue("@DocumentoID", id);
                        command.Parameters.AddWithValue("@Nombre", documento.nombre?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Tipo", documento.tipo?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Categoria", documento.categoria?.ToString() ?? "");
                        command.Parameters.AddWithValue("@Descripcion", documento.descripcion?.ToString());
                        command.Parameters.AddWithValue("@Estado", documento.estado?.ToString() ?? "draft");
                        command.Parameters.AddWithValue("@RutaArchivo", documento.rutaArchivo?.ToString());
                        command.Parameters.AddWithValue("@FechaModificacion", DateTime.UtcNow);



                        var rowsAffected = await command.ExecuteNonQueryAsync();


                        if (rowsAffected == 0)
                        {

                            _logger.LogWarning($"Document with ID {id} not found for update");
                            return NotFound(new { message = $"Documento con ID {id} no encontrado" });
                        }
                    }
                }


                _logger.LogDebug($"Document with ID {id} updated successfully");



                return await GetById(id);
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error updating document with ID: {id}");

                return StatusCode(500, new { message = "Error al actualizar documento", error = ex.Message });
            }
        }








        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)
        {
            try
            {

                _logger.LogDebug($"Deleting document with ID: {id}");


                string? rutaArchivo = null;


                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();


                    var selectQuery = "SELECT RutaArchivo FROM Documento WHERE DocumentoID = @DocumentoID";
                    using (var selectCommand = new MySqlCommand(selectQuery, connection))
                    {

                        selectCommand.Parameters.AddWithValue("@DocumentoID", id);

                        rutaArchivo = await selectCommand.ExecuteScalarAsync() as string;
                    }


                    var deleteQuery = "DELETE FROM Documento WHERE DocumentoID = @DocumentoID";
                    using (var deleteCommand = new MySqlCommand(deleteQuery, connection))
                    {

                        deleteCommand.Parameters.AddWithValue("@DocumentoID", id);

                        var rowsAffected = await deleteCommand.ExecuteNonQueryAsync();


                        if (rowsAffected == 0)
                        {

                            _logger.LogWarning($"Document with ID {id} not found for deletion");
                            return NotFound(new { message = $"Documento con ID {id} no encontrado" });
                        }
                    }
                }


                if (!string.IsNullOrEmpty(rutaArchivo))
                {

                    var fileName = Path.GetFileName(rutaArchivo);

                    var fullPath = Path.Combine(_uploadsPath, fileName);


                    if (System.IO.File.Exists(fullPath))
                    {

                        System.IO.File.Delete(fullPath);
                        _logger.LogDebug($"File deleted: {fullPath}");
                    }
                }


                _logger.LogDebug($"Document with ID {id} deleted successfully");


                return Ok(new { message = "Documento eliminado correctamente" });
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error deleting document with ID: {id}");

                return StatusCode(500, new { message = "Error al eliminar documento", error = ex.Message });
            }
        }








        [HttpPost("{id}/view")]

        public async Task<IActionResult> IncrementViews(int id)
        {
            try
            {

                _logger.LogDebug($"Incrementing views for document ID: {id}");


                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();




                    var query = @"UPDATE Documento SET
                        NumeroVistas = NumeroVistas + 1,
                        FechaUltimoAcceso = @FechaUltimoAcceso
                        WHERE DocumentoID = @DocumentoID";


                    using (var command = new MySqlCommand(query, connection))
                    {

                        command.Parameters.AddWithValue("@DocumentoID", id);
                        command.Parameters.AddWithValue("@FechaUltimoAcceso", DateTime.UtcNow);


                        await command.ExecuteNonQueryAsync();
                    }
                }


                _logger.LogDebug($"Views incremented for document ID: {id}");


                return Ok(new { message = "Vista registrada correctamente" });
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error incrementing views for document ID: {id}");

                return StatusCode(500, new { message = "Error al registrar vista", error = ex.Message });
            }
        }








        [HttpPost("{id}/download")]

        public async Task<IActionResult> IncrementDownloads(int id)
        {
            try
            {

                _logger.LogDebug($"Incrementing downloads for document ID: {id}");


                using (var connection = new MySqlConnection(_connectionString))
                {

                    await connection.OpenAsync();




                    var query = @"UPDATE Documento SET
                        NumeroDescargas = NumeroDescargas + 1,
                        FechaUltimoAcceso = @FechaUltimoAcceso
                        WHERE DocumentoID = @DocumentoID";


                    using (var command = new MySqlCommand(query, connection))
                    {

                        command.Parameters.AddWithValue("@DocumentoID", id);
                        command.Parameters.AddWithValue("@FechaUltimoAcceso", DateTime.UtcNow);


                        await command.ExecuteNonQueryAsync();
                    }
                }


                _logger.LogDebug($"Downloads incremented for document ID: {id}");


                return Ok(new { message = "Descarga registrada correctamente" });
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Error incrementing downloads for document ID: {id}");

                return StatusCode(500, new { message = "Error al registrar descarga", error = ex.Message });
            }
        }









        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GetPdfPreview(int id)
        {
            try
            {
                _logger.LogDebug($"Generating PDF preview for document ID: {id}");


                string? rutaArchivo = null;
                string? extension = null;
                string? nombreArchivo = null;


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


                if (string.IsNullOrEmpty(rutaArchivo))
                {
                    _logger.LogWarning($"Document {id} not found or has no file");
                    return NotFound(new { message = "Documento no encontrado o sin archivo" });
                }


                var fileName = Path.GetFileName(rutaArchivo);
                var filePath = Path.Combine(_uploadsPath, fileName);


                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning($"File not found: {filePath}");
                    return NotFound(new { message = "Archivo no encontrado en el servidor" });
                }


                if (extension?.ToLower() == "pdf")
                {
                    _logger.LogDebug($"Document {id} is already PDF, returning directly");
                    var pdfBytes = await System.IO.File.ReadAllBytesAsync(filePath);


                    Response.Headers["Content-Disposition"] = "inline";
                    return File(pdfBytes, "application/pdf");
                }


                byte[]? pdfContent = null;


                if (extension?.ToLower() == "xlsx" || extension?.ToLower() == "xls")
                {
                    _logger.LogDebug($"Converting Excel file to PDF (No Watermark): {filePath}");
                    pdfContent = await _pdfConversionService.ConvertExcelToPdfAsync(filePath);
                }

                else if (extension?.ToLower() == "docx" || extension?.ToLower() == "doc")
                {
                    _logger.LogDebug($"Converting Word file to PDF (No Watermark): {filePath}");
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

                _logger.LogDebug($"Successfully converted document {id} to PDF ({pdfContent.Length} bytes)");


                Response.Headers["Content-Disposition"] = "inline";


                return File(pdfContent, "application/pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating PDF preview for document {id}");
                return StatusCode(500, new { message = "Error al generar vista previa PDF", error = ex.Message });
            }
        }









        private string FormatFileSize(long bytes)
        {

            string[] sizes = { "Bytes", "KB", "MB", "GB", "TB" };

            double len = bytes;

            int order = 0;



            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }




            return String.Format("{0:0.##} {1}", len, sizes[order]);
        }
    }
}


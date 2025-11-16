using FlexoAPP.API.Models.Entities;
using flexoAPP.Models.DTOs;
using flexoAPP.Repositories;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using System.Text.Json;
using FlexoAPP.API.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace flexoAPP.Services
{
    public class MaquinaService : IMaquinaService
    {
        private readonly IMaquinaRepository _repository;
        private readonly ILogger<MaquinaService> _logger;
        private readonly FlexoAPPDbContext _context;

        public MaquinaService(IMaquinaRepository repository, ILogger<MaquinaService> logger, FlexoAPPDbContext context)
        {
            _repository = repository;
            _logger = logger;
            _context = context;
        }

        public async Task<IEnumerable<MaquinaDto>> GetAllAsync()
        {
            var maquinas = await _repository.GetAllAsync();
            return maquinas.Select(MapToDto);
        }

        public async Task<MaquinaDto?> GetByArticuloAsync(string articulo)
        {
            var maquina = await _repository.GetByArticuloAsync(articulo);
            return maquina != null ? MapToDto(maquina) : null;
        }

        public async Task<IEnumerable<MaquinaDto>> GetByNumeroMaquinaAsync(int numeroMaquina)
        {
            var maquinas = await _repository.GetByNumeroMaquinaAsync(numeroMaquina);
            return maquinas.Select(MapToDto);
        }

        public async Task<MaquinaDto> CreateAsync(CreateMaquinaDto createDto, int? userId)
        {
            try
            {
                // Usar SQL RAW para evitar problemas con Entity Framework
                var connectionString = _context.Database.GetConnectionString();
                using var connection = new MySqlConnector.MySqlConnection(connectionString);
                await connection.OpenAsync();

                // ===== VERIFICAR SI YA EXISTE EL REGISTRO =====
                // Verificar si ya existe un registro con la misma combinación de artículo + máquina
                // IMPORTANTE: La clave única es articulo + numero_maquina, NO solo articulo
                // Esto permite tener el mismo artículo en diferentes máquinas
                using var checkCommand = connection.CreateCommand();
                checkCommand.CommandText = "SELECT COUNT(*) FROM maquinas WHERE articulo = @articulo AND numero_maquina = @numeroMaquina";
                checkCommand.Parameters.AddWithValue("@articulo", createDto.Articulo);
                checkCommand.Parameters.AddWithValue("@numeroMaquina", createDto.NumeroMaquina);
                var exists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;
                
                // Log para debugging - mostrar si el registro existe o no
                _logger.LogInformation("🔍 Verificando existencia: Artículo={Articulo}, Máquina={Maquina}, Existe={Existe}", 
                    createDto.Articulo, createDto.NumeroMaquina, exists);

                var coloresJson = System.Text.Json.JsonSerializer.Serialize(createDto.Colores);
                var fechaTinta = createDto.FechaTintaEnMaquina ?? DateTime.Now;

                if (exists)
                {
                    // ===== ACTUALIZAR REGISTRO EXISTENTE =====
                    // Si ya existe un registro con la misma combinación articulo + máquina, actualizarlo
                    // Esto permite actualizar datos de un programa que ya fue cargado previamente
                    using var updateCommand = connection.CreateCommand();
                    updateCommand.CommandText = @"
                        UPDATE maquinas SET
                            ot_sap = @otSap,
                            cliente = @cliente,
                            referencia = @referencia,
                            td = @td,
                            numero_colores = @numeroColores,
                            colores = @colores,
                            kilos = @kilos,
                            fecha_tinta_en_maquina = @fechaTinta,
                            sustrato = @sustrato,
                            estado = @estado,
                            observaciones = @observaciones,
                            updated_by = @updatedBy,
                            updated_at = @updatedAt
                        WHERE articulo = @articulo AND numero_maquina = @numeroMaquina";

                    // Agregar parámetros al comando UPDATE
                    // NOTA: numero_maquina NO se actualiza, solo se usa en el WHERE
                    updateCommand.Parameters.AddWithValue("@otSap", createDto.OtSap);
                    updateCommand.Parameters.AddWithValue("@cliente", createDto.Cliente);
                    updateCommand.Parameters.AddWithValue("@referencia", createDto.Referencia ?? (object)DBNull.Value);
                    updateCommand.Parameters.AddWithValue("@td", createDto.Td ?? (object)DBNull.Value);
                    updateCommand.Parameters.AddWithValue("@numeroColores", createDto.Colores.Count);
                    updateCommand.Parameters.AddWithValue("@colores", coloresJson);
                    updateCommand.Parameters.AddWithValue("@kilos", createDto.Kilos);
                    updateCommand.Parameters.AddWithValue("@fechaTinta", fechaTinta);
                    updateCommand.Parameters.AddWithValue("@sustrato", createDto.Sustrato);
                    updateCommand.Parameters.AddWithValue("@estado", string.IsNullOrWhiteSpace(createDto.Estado) ? (object)DBNull.Value : createDto.Estado);
                    updateCommand.Parameters.AddWithValue("@observaciones", createDto.Observaciones ?? (object)DBNull.Value);
                    updateCommand.Parameters.AddWithValue("@updatedBy", userId ?? (object)DBNull.Value);
                    updateCommand.Parameters.AddWithValue("@updatedAt", DateTime.UtcNow);
                    // Parámetros para el WHERE clause
                    updateCommand.Parameters.AddWithValue("@articulo", createDto.Articulo);
                    updateCommand.Parameters.AddWithValue("@numeroMaquina", createDto.NumeroMaquina);

                    // Ejecutar el comando UPDATE
                    await updateCommand.ExecuteNonQueryAsync();
                    
                    // Log de confirmación con más detalles
                    _logger.LogInformation("✅ Registro actualizado: Artículo={Articulo}, Máquina={Maquina}", 
                        createDto.Articulo, createDto.NumeroMaquina);
                }
                else
                {
                    // Insertar nuevo registro
                    using var insertCommand = connection.CreateCommand();
                    insertCommand.CommandText = @"
                        INSERT INTO maquinas (
                            articulo, numero_maquina, ot_sap, cliente, referencia, td,
                            numero_colores, colores, kilos, fecha_tinta_en_maquina, sustrato,
                            estado, observaciones, created_by, updated_by, created_at, updated_at
                        ) VALUES (
                            @articulo, @numeroMaquina, @otSap, @cliente, @referencia, @td,
                            @numeroColores, @colores, @kilos, @fechaTinta, @sustrato,
                            @estado, @observaciones, @createdBy, @updatedBy, @createdAt, @updatedAt
                        )";

                    insertCommand.Parameters.AddWithValue("@articulo", createDto.Articulo);
                    insertCommand.Parameters.AddWithValue("@numeroMaquina", createDto.NumeroMaquina);
                    insertCommand.Parameters.AddWithValue("@otSap", createDto.OtSap);
                    insertCommand.Parameters.AddWithValue("@cliente", createDto.Cliente);
                    insertCommand.Parameters.AddWithValue("@referencia", createDto.Referencia ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@td", createDto.Td ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@numeroColores", createDto.Colores.Count);
                    insertCommand.Parameters.AddWithValue("@colores", coloresJson);
                    insertCommand.Parameters.AddWithValue("@kilos", createDto.Kilos);
                    insertCommand.Parameters.AddWithValue("@fechaTinta", fechaTinta);
                    insertCommand.Parameters.AddWithValue("@sustrato", createDto.Sustrato);
                    insertCommand.Parameters.AddWithValue("@estado", string.IsNullOrWhiteSpace(createDto.Estado) ? (object)DBNull.Value : createDto.Estado);
                    insertCommand.Parameters.AddWithValue("@observaciones", createDto.Observaciones ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@createdBy", userId ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@updatedBy", userId ?? (object)DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@createdAt", DateTime.UtcNow);
                    insertCommand.Parameters.AddWithValue("@updatedAt", DateTime.UtcNow);

                    // Ejecutar el comando INSERT
                    await insertCommand.ExecuteNonQueryAsync();
                    
                    // Log de confirmación con más detalles
                    _logger.LogInformation("✅ Registro creado: Artículo={Articulo}, Máquina={Maquina}", 
                        createDto.Articulo, createDto.NumeroMaquina);
                }

                // Retornar DTO
                return new MaquinaDto
                {
                    Articulo = createDto.Articulo,
                    NumeroMaquina = createDto.NumeroMaquina,
                    OtSap = createDto.OtSap,
                    Cliente = createDto.Cliente,
                    Referencia = createDto.Referencia,
                    Td = createDto.Td,
                    NumeroColores = createDto.Colores.Count,
                    Colores = createDto.Colores,
                    Kilos = createDto.Kilos,
                    FechaTintaEnMaquina = fechaTinta,
                    Sustrato = createDto.Sustrato,
                    Estado = createDto.Estado,
                    Observaciones = createDto.Observaciones,
                    CreatedBy = userId,
                    UpdatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creando/actualizando registro: {Articulo}", createDto.Articulo);
                throw;
            }
        }

        public async Task<MaquinaDto> UpdateAsync(string articulo, UpdateMaquinaDto updateDto, int? userId)
        {
            var existing = await _repository.GetByArticuloAsync(articulo);
            if (existing == null)
            {
                throw new KeyNotFoundException($"Máquina con artículo {articulo} no encontrada");
            }

            if (updateDto.NumeroMaquina.HasValue)
                existing.NumeroMaquina = updateDto.NumeroMaquina.Value;

            if (!string.IsNullOrEmpty(updateDto.OtSap))
                existing.OtSap = updateDto.OtSap;

            if (!string.IsNullOrEmpty(updateDto.Cliente))
                existing.Cliente = updateDto.Cliente;

            if (!string.IsNullOrEmpty(updateDto.Referencia))
                existing.Referencia = updateDto.Referencia;

            if (!string.IsNullOrEmpty(updateDto.Td))
                existing.Td = updateDto.Td;

            if (updateDto.Colores != null && updateDto.Colores.Any())
                existing.SetColoresArray(updateDto.Colores.ToArray());

            if (updateDto.Kilos.HasValue)
                existing.Kilos = updateDto.Kilos.Value;

            if (updateDto.FechaTintaEnMaquina.HasValue)
                existing.FechaTintaEnMaquina = updateDto.FechaTintaEnMaquina.Value;

            if (!string.IsNullOrEmpty(updateDto.Sustrato))
                existing.Sustrato = updateDto.Sustrato;

            if (!string.IsNullOrEmpty(updateDto.Estado))
                existing.Estado = updateDto.Estado;

            if (updateDto.Observaciones != null)
                existing.Observaciones = updateDto.Observaciones;

            existing.UpdatedBy = userId;
            existing.LastActionBy = userId?.ToString();
            existing.LastActionAt = DateTime.UtcNow;

            var updated = await _repository.UpdateAsync(existing);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(string articulo)
        {
            return await _repository.DeleteAsync(articulo);
        }

        public async Task<ExcelProcessResultDto> ProcessExcelFileAsync(IFormFile file, int? userId)
        {
            try
            {
                _logger.LogInformation("🔄 Procesando archivo: {FileName} ({FileSize} bytes)", file.FileName, file.Length);

                var programs = new List<MaquinaDto>();
                var validationErrors = new List<string>();

                // Configurar EPPlus para uso no comercial
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

           
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                _logger.LogInformation("📄 Tipo de archivo: {Extension}", fileExtension);
                _logger.LogInformation("📊 Procesando archivo Excel con EPPlus...");
                
                using var stream = file.OpenReadStream();
                using var package = new ExcelPackage(stream);
                
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                if (worksheet == null)
                {
                    return new ExcelProcessResultDto
                    {
                        Success = false,
                        ErrorMessage = "El archivo Excel no contiene hojas de trabajo"
                    };
                }

                _logger.LogInformation("📄 Hoja: {SheetName}, Filas: {RowCount}, Columnas: {ColCount}", 
                    worksheet.Name, worksheet.Dimension?.Rows ?? 0, worksheet.Dimension?.Columns ?? 0);

                // Verificar si hay datos
                if (worksheet.Dimension == null || worksheet.Dimension.Rows < 2)
                {
                    _logger.LogWarning("⚠️ El archivo Excel no tiene datos (solo tiene {Rows} filas)", worksheet.Dimension?.Rows ?? 0);
                    return new ExcelProcessResultDto
                    {
                        Success = false,
                        ErrorMessage = "El archivo Excel no contiene datos. Debe tener al menos una fila de encabezados y una fila de datos."
                    };
                }

                // Mostrar encabezados para debugging
                _logger.LogInformation("📋 Encabezados (Fila 1):");
                for (int col = 1; col <= worksheet.Dimension.Columns; col++)
                {
                    var headerValue = worksheet.Cells[1, col].Text ?? "";
                    _logger.LogInformation("  Columna {Col}: '{Header}'", col, headerValue);
                }

                var dataLines = new List<string>();
                
                // Leer desde la fila 2 (saltando encabezados)
                for (int row = 2; row <= worksheet.Dimension.Rows; row++)
                {
                    var rowData = new List<string>();
                    for (int col = 1; col <= worksheet.Dimension.Columns; col++)
                    {
                        var cellValue = worksheet.Cells[row, col].Text ?? "";
                        rowData.Add(cellValue);
                    }
                    
                    // Verificar si la fila tiene datos
                    if (rowData.All(string.IsNullOrWhiteSpace))
                    {
                        _logger.LogInformation("⏭️ Fila {Row} vacía, saltando...", row);
                        continue;
                    }
                    
                    // Convertir a formato CSV para usar el mismo procesador
                    var csvLine = string.Join(",", rowData.Select(v => $"\"{v}\""));
                    dataLines.Add(csvLine);
                    _logger.LogInformation("📝 Fila {Row} ({Cols} columnas): {Data}", row, rowData.Count, csvLine.Substring(0, Math.Min(150, csvLine.Length)));
                }

                _logger.LogInformation("📋 Total de líneas de datos encontradas: {Count}", dataLines.Count);

                // Procesar cada línea
                _logger.LogInformation("🔄 Procesando {Count} líneas de datos...", dataLines.Count);
                
                foreach (var dataLine in dataLines)
                {
                    try
                    {
                        var program = await ProcessExcelLine(dataLine, userId);
                        if (program != null)
                        {
                            programs.Add(program);
                            _logger.LogInformation("✅ Programa procesado: {Articulo}", program.Articulo);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "⚠️ Error procesando línea: {Line}", dataLine.Substring(0, Math.Min(50, dataLine.Length)));
                        validationErrors.Add($"Error en línea '{dataLine.Substring(0, Math.Min(50, dataLine.Length))}...': {ex.Message}");
                    }
                }

                _logger.LogInformation("✅ Procesamiento completado: {Count} programas procesados", programs.Count);

                return new ExcelProcessResultDto
                {
                    Success = true,
                    ProcessedCount = programs.Count,
                    Programs = programs,
                    ValidationErrors = validationErrors.Any() ? validationErrors : null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error procesando archivo");
                return new ExcelProcessResultDto
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        // ===== MÉTODO PRIVADO PARA PROCESAR UNA LÍNEA DEL ARCHIVO EXCEL =====
        // Este método toma una línea del archivo Excel (en formato CSV) y la convierte en un objeto MaquinaDto
        // Parámetros:
        //   - line: Línea del archivo en formato CSV (valores separados por comas)
        //   - userId: ID del usuario que está cargando el archivo (para auditoría)
        // Retorna: MaquinaDto con los datos procesados o null si hay error
        private async Task<MaquinaDto?> ProcessExcelLine(string line, int? userId)
        {
            // ===== PARSEAR LA LÍNEA CSV EN COLUMNAS =====
            // Convertir la línea CSV en un array de strings (una por cada columna)
            // El método ParseCsvLine maneja correctamente las comillas y comas dentro de valores
        // ===== MÉTODO PRIVADO PARA PROCESAR UNA LÍNEA DEL ARCHIVO EXCEL =====
        // Este método toma una línea del archivo Excel (en formato CSV) y la convierte en un objeto MaquinaDto
        // Parámetros:
        //   - line: Línea del archivo en formato CSV (valores separados por comas)
        //   - userId: ID del usuario que está cargando el archivo (para auditoría)
        // Retorna: MaquinaDto con los datos procesados o null si hay error
        private async Task<MaquinaDto?> ProcessExcelLine(string line, int? userId)
        {
            // ===== PASO 1: PARSEAR LA LÍNEA CSV EN COLUMNAS =====
            // Llamar al método ParseCsvLine que convierte la línea CSV en un array de strings
            // Este método maneja correctamente las comillas y comas dentro de valores
            var columns = ParseCsvLine(line);
            
            // ===== PASO 2: LOG DE INFORMACIÓN DE LA LÍNEA =====
            // Registrar en el log cuántas columnas se encontraron en esta línea para debugging
            _logger.LogInformation("📋 Procesando línea con {Count} columnas", columns.Count);
            
            // Registrar el contenido de cada columna con su índice para facilitar el debugging
            // Formato: [0]=valor1 | [1]=valor2 | [2]=valor3 ...
            _logger.LogInformation("📋 Datos: {Data}", string.Join(" | ", columns.Select((c, i) => $"[{i}]={c}")));
            
            // ===== PASO 3: VALIDACIÓN DEL NÚMERO DE COLUMNAS =====
            // Verificar que el archivo tenga al menos 10 columnas según el formato esperado
            // Si tiene menos columnas, el archivo no es válido y se debe rechazar
            if (columns.Count < 10)
            {
                // Construir un mensaje de error detallado que explique el formato esperado
                // Este mensaje ayuda al usuario a corregir el archivo Excel
                var errorMsg = $"Formato inválido: Se esperan al menos 10 columnas, se encontraron {columns.Count}.\n" +
                              $"Columnas esperadas:\n" +
                              $"1. MQ IMP (Número de máquina impresora)\n" +
                              $"2. ARTICULO F (Código del artículo)\n" +
                              $"3. OT SAP (Orden de trabajo)\n" +
                              $"4. CLIENTE (Nombre del cliente)\n" +
                              $"5. REFERENCIA (Referencia del producto)\n" +
                              $"6. TD (Tipo de diseño)\n" +
                              $"7. NUMERO DE COLORES (Cantidad de colores)\n" +
                              $"8. KILOS (Cantidad en kilogramos)\n" +
                              $"9. COLORES EN MAQUINA (Fecha de preparación - ej: '10-nov-25 05 PM')\n" +
                              $"10. SUSTRATOS (Tipo de material)";
                
                // Lanzar excepción con el mensaje de error para detener el procesamiento
                throw new ArgumentException(errorMsg);
            }
            
            // ===== PASO 4: VALIDACIÓN DE CAMPOS OBLIGATORIOS =====
            // Verificar que el campo ARTICULO F (columna 1) no esté vacío
            // Este campo es la clave primaria y debe ser único y obligatorio
            if (string.IsNullOrWhiteSpace(columns[1]))
            {
                // Lanzar excepción si el artículo está vacío
                throw new ArgumentException("El campo ARTICULO F (columna 2) es obligatorio y no puede estar vacío");
            }
            
            // Verificar que el campo OT SAP (columna 2) no esté vacío
            // La orden de trabajo es obligatoria para identificar el trabajo
            if (string.IsNullOrWhiteSpace(columns[2]))
            {
                // Lanzar excepción si la OT SAP está vacía
                throw new ArgumentException("El campo OT SAP (columna 3) es obligatorio y no puede estar vacío");
            }
            
            // Verificar que el campo CLIENTE (columna 3) no esté vacío
            // El nombre del cliente es obligatorio para la trazabilidad
            if (string.IsNullOrWhiteSpace(columns[3]))
            {
                // Lanzar excepción si el cliente está vacío
                throw new ArgumentException("El campo CLIENTE (columna 4) es obligatorio y no puede estar vacío");
            }

            // ===== DOCUMENTACIÓN: FORMATO CORRECTO DEL ARCHIVO (10 COLUMNAS) =====
            // Columna 0: MQ IMP - Número de máquina impresora (11-21)
            // Columna 1: ARTICULO F - Código del artículo (único, clave primaria)
            // Columna 2: OT SAP - Orden de trabajo SAP
            // Columna 3: CLIENTE - Nombre del cliente
            // Columna 4: REFERENCIA - Referencia del producto
            // Columna 5: TD - Código TD (Tipo de Diseño)
            // Columna 6: NUMERO DE COLORES - Cantidad de colores (1-10)
            // Columna 7: KILOS - Cantidad en kilogramos
            // Columna 8: COLORES EN MAQUINA - Fecha y hora de preparación de colores (ej: "10-nov-25 05 PM")
            //            IMPORTANTE: Esta columna contiene la FECHA de preparación, NO los nombres de colores
            // Columna 9: SUSTRATOS - Tipo de material base (ej: BOPP, PE, PET)

            // ===== PASO 5: PARSEAR NÚMERO DE MÁQUINA (COLUMNA 0) =====
            // Declarar variable para almacenar el número de máquina con valor por defecto 11
            int numeroMaquina = 11;
            
            // Intentar convertir el valor de la columna 0 a número entero
            if (int.TryParse(columns[0], out var machine))
            {
                // Si la conversión es exitosa, usar el valor parseado
                numeroMaquina = machine;
                // Registrar en el log el número de máquina parseado
                _logger.LogInformation("🖨️ Máquina impresora: {Machine}", numeroMaquina);
            }
            else
            {
                // Si la conversión falla, registrar advertencia y usar valor por defecto (11)
                _logger.LogWarning("⚠️ No se pudo parsear número de máquina '{Machine}', usando 11 por defecto", columns[0]);
            }

            // ===== PASO 6: PARSEAR NÚMERO DE COLORES (COLUMNA 6) =====
            // Declarar variable para almacenar la cantidad de colores con valor inicial 0
            int numeroColores = 0;
            
            // Intentar convertir el valor de la columna 6 a número entero
            if (int.TryParse(columns[6], out var numCol))
            {
                // Si la conversión es exitosa, usar el valor parseado
                numeroColores = numCol;
                // Registrar en el log la cantidad de colores parseada
                _logger.LogInformation("🎨 Número de colores: {Count}", numeroColores);
            }
            else
            {
                // Si la conversión falla, registrar advertencia y usar 0 por defecto
                _logger.LogWarning("⚠️ No se pudo parsear número de colores '{NumColores}', usando 0", columns[6]);
            }

            // ===== PASO 7: PARSEAR FECHA DE PREPARACIÓN DE COLORES (COLUMNA 8) =====
            // La columna 8 "COLORES EN MAQUINA" contiene la FECHA Y HORA de preparación de colores
            // Formato esperado: "10-nov-25 05 PM" o "dd-MMM-yy hh tt"
            // Declarar variable para almacenar la fecha de preparación de colores
            DateTime? fechaTintaEnMaquina = null;
            
            // Registrar en el log el valor original de la fecha antes de procesarlo
            _logger.LogInformation("📅 Parseando fecha de preparación de colores - Valor original: '{Fecha}' (columna 9)", columns[8]);
            
            // Verificar si la columna 8 tiene contenido (no está vacía ni es solo espacios)
            if (!string.IsNullOrWhiteSpace(columns[8]))
            {
                // Intentar parsear la fecha usando DateTime.TryParse
                // Este método intenta automáticamente varios formatos de fecha comunes
                if (DateTime.TryParse(columns[8], out var fecha))
                {
                    // Si la conversión es exitosa, usar la fecha parseada
                    fechaTintaEnMaquina = fecha;
                    // Registrar en el log la fecha parseada exitosamente
                    _logger.LogInformation("✅ Fecha de preparación parseada exitosamente: {Fecha}", fechaTintaEnMaquina);
                }
                else
                {
                    // Si la conversión falla, usar la fecha actual como fallback
                    fechaTintaEnMaquina = DateTime.Now;
                    // Registrar advertencia indicando que no se pudo parsear la fecha
                    _logger.LogWarning("⚠️ No se pudo parsear la fecha '{Fecha}', usando fecha actual", columns[8]);
                }
            }
            else
            {
                // Si la columna 8 está vacía, usar la fecha actual
                fechaTintaEnMaquina = DateTime.Now;
                // Registrar advertencia indicando que la fecha está vacía
                _logger.LogWarning("⚠️ Fecha de preparación vacía (columna 9), usando fecha actual");
            }
            
            // ===== PASO 7B: GENERAR COLORES GENÉRICOS BASADOS EN EL NÚMERO =====
            // Como los colores NO vienen en el archivo Excel, generar nombres genéricos
            // Crear una lista vacía para almacenar los colores
            var colores = new List<string>();
            
            // Usar un bucle for para crear colores genéricos basados en el número de colores (columna 6)
            for (int i = 0; i < numeroColores; i++)
            {
                // Agregar color genérico con formato "COLOR1", "COLOR2", "COLOR3", etc.
                colores.Add($"COLOR{i + 1}");
            }
            
            // Registrar en el log los colores genéricos creados
            _logger.LogInformation("🎨 Colores genéricos creados: {Colores}", string.Join(", ", colores));

            // ===== PASO 8: PARSEAR KILOS (COLUMNA 7) =====
            // Los kilos pueden venir con coma (,) o punto (.) como separador decimal
            // Declarar variable para almacenar los kilos con valor inicial 0
            decimal kilos = 0;
            
            // Registrar en el log el valor original de kilos antes de procesarlo
            _logger.LogInformation("🔍 Parseando kilos - Valor original: '{Kilos}' (columna 8)", columns[7]);
            
            // Verificar si la columna 7 tiene contenido (no está vacía ni es solo espacios)
            if (!string.IsNullOrWhiteSpace(columns[7]))
            {
                // Limpiar el valor de kilos:
                // 1. Replace(",", "."): Reemplazar coma por punto para formato decimal estándar
                // 2. Replace(" ", ""): Eliminar todos los espacios
                // 3. Trim(): Eliminar espacios al inicio y final
                var kilosStr = columns[7]
                    .Replace(",", ".")
                    .Replace(" ", "")
                    .Trim();
                
                // Registrar en el log el valor de kilos después de la limpieza
                _logger.LogInformation("🔍 Kilos después de limpieza: '{KilosLimpio}'", kilosStr);
                
                // Intentar convertir el valor limpio a decimal usando cultura invariante
                // NumberStyles.Any: Acepta cualquier formato numérico válido
                // InvariantCulture: Usa punto como separador decimal
                if (decimal.TryParse(kilosStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out kilos))
                {
                    // Si la conversión es exitosa, registrar el valor parseado
                    _logger.LogInformation("✅ Kilos parseados exitosamente: {Kilos}", kilos);
                }
                else
                {
                    // Si la conversión falla, registrar advertencia y usar 0 por defecto
                    _logger.LogWarning("⚠️ No se pudo parsear kilos '{Kilos}', usando 0", columns[7]);
                    kilos = 0;
                }
            }
            else
            {
                // Si la columna de kilos está vacía, registrar advertencia y usar 0
                _logger.LogWarning("⚠️ Columna de kilos vacía (columna 8), usando 0");
                kilos = 0;
            }

            // ===== PASO 9: VALIDAR FECHA DE TINTA EN MÁQUINA =====
            // La fecha ya fue parseada en el PASO 7 desde la columna 8
            // Aquí solo validamos que tengamos una fecha válida
            if (!fechaTintaEnMaquina.HasValue)
            {
                // Si por alguna razón no hay fecha, usar la fecha actual como fallback
                fechaTintaEnMaquina = DateTime.Now;
                // Registrar advertencia
                _logger.LogWarning("⚠️ No hay fecha de tinta válida, usando fecha actual");
            }
            
            // Registrar en el log la fecha final que se usará
            _logger.LogInformation("📅 Fecha de tinta en máquina final: {Fecha}", fechaTintaEnMaquina);

            // ===== PASO 10: CREAR DTO CON LOS DATOS PROCESADOS =====
            // Crear un objeto CreateMaquinaDto con todos los datos parseados y validados
            // Este DTO se usará para crear o actualizar el registro en la base de datos
            var createDto = new CreateMaquinaDto
            {
                // Asignar número de máquina parseado de la columna 0
                NumeroMaquina = numeroMaquina,
                
                // Asignar código de artículo directamente de la columna 1 (ya validado como no vacío)
                Articulo = columns[1],
                
                // Asignar orden de trabajo SAP directamente de la columna 2 (ya validado como no vacío)
                OtSap = columns[2],
                
                // Asignar nombre del cliente directamente de la columna 3 (ya validado como no vacío)
                Cliente = columns[3],
                
                // Asignar referencia del producto directamente de la columna 4
                Referencia = columns[4],
                
                // Asignar código TD (Tipo de Diseño) directamente de la columna 5
                Td = columns[5],
                
                // Asignar lista de colores parseada de la columna 8
                Colores = colores,
                
                // Asignar kilos parseados de la columna 7
                Kilos = kilos,
                
                // Asignar fecha actual (no viene en el archivo)
                FechaTintaEnMaquina = fechaTintaEnMaquina,
                
                // Asignar tipo de sustrato directamente de la columna 9
                Sustrato = columns[9],
                
                // Establecer estado como vacío - El operario debe asignar el primer estado manualmente
                Estado = "",
                
                // Agregar observación indicando que es un programa nuevo pendiente de asignación
                Observaciones = "Programa nuevo - Pendiente de asignación de estado por operario"
            };

            // ===== PASO 11: LOG DE CONFIRMACIÓN =====
            // Registrar en el log un resumen del DTO creado con los datos más importantes
            _logger.LogInformation("✅ DTO creado: Máquina={Machine}, Artículo={Articulo}, OT={OT}, Cliente={Cliente}, Kilos={Kilos}, Colores={Colores}", 
                createDto.NumeroMaquina, createDto.Articulo, createDto.OtSap, createDto.Cliente, createDto.Kilos, string.Join(",", createDto.Colores));

            // ===== PASO 12: CREAR O ACTUALIZAR REGISTRO EN LA BASE DE DATOS =====
            // Llamar al método CreateAsync que inserta o actualiza el registro en la base de datos
            // Este método retorna un MaquinaDto con los datos guardados
            return await CreateAsync(createDto, userId);
        }
                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    columns.Add(currentColumn.ToString().Trim());
                    currentColumn.Clear();
                }
                else
                {
                    currentColumn.Append(c);
                }
            }

            columns.Add(currentColumn.ToString().Trim());
            return columns;
        }

        public async Task<int> ClearAllProgrammingAsync(int? userId)
        {
            try
            {
                _logger.LogWarning("🗑️ Limpiando toda la programación de máquinas - Usuario: {UserId}", userId);

                // NOTA: Usar SQL RAW temporalmente debido a problemas con Entity Framework
                // var allPrograms = await _repository.GetAllAsync();
                // int deletedCount = 0;
                // foreach (var program in allPrograms)
                // {
                //     await _repository.DeleteAsync(program.Articulo);
                //     deletedCount++;
                // }
                
                // Por ahora retornar 0 hasta que se arregle el problema de EF
                _logger.LogWarning("⚠️ Método ClearAllProgrammingAsync temporalmente deshabilitado");
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error limpiando programación");
                throw;
            }
        }

        private MaquinaDto MapToDto(Maquina maquina)
        {
            return new MaquinaDto
            {
                Articulo = maquina.Articulo,
                NumeroMaquina = maquina.NumeroMaquina,
                OtSap = maquina.OtSap,
                Cliente = maquina.Cliente,
                Referencia = maquina.Referencia,
                Td = maquina.Td,
                NumeroColores = maquina.NumeroColores,
                Colores = maquina.GetColoresArray().ToList(),
                Kilos = maquina.Kilos,
                FechaTintaEnMaquina = maquina.FechaTintaEnMaquina,
                Sustrato = maquina.Sustrato,
                Estado = maquina.Estado,
                Observaciones = maquina.Observaciones,
                LastActionBy = maquina.LastActionBy,
                LastActionAt = maquina.LastActionAt,
                CreatedBy = maquina.CreatedBy,
                UpdatedBy = maquina.UpdatedBy,
                CreatedAt = maquina.CreatedAt,
                UpdatedAt = maquina.UpdatedAt
            };
        }
    }
}

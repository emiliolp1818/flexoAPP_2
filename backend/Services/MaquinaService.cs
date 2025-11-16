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

                // Verificar si ya existe
                using var checkCommand = connection.CreateCommand();
                checkCommand.CommandText = "SELECT COUNT(*) FROM maquinas WHERE articulo = @articulo";
                checkCommand.Parameters.AddWithValue("@articulo", createDto.Articulo);
                var exists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync()) > 0;

                var coloresJson = System.Text.Json.JsonSerializer.Serialize(createDto.Colores);
                var fechaTinta = createDto.FechaTintaEnMaquina ?? DateTime.Now;

                if (exists)
                {
                    // Actualizar registro existente
                    using var updateCommand = connection.CreateCommand();
                    updateCommand.CommandText = @"
                        UPDATE maquinas SET
                            numero_maquina = @numeroMaquina,
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
                        WHERE articulo = @articulo";

                    updateCommand.Parameters.AddWithValue("@numeroMaquina", createDto.NumeroMaquina);
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
                    updateCommand.Parameters.AddWithValue("@articulo", createDto.Articulo);

                    await updateCommand.ExecuteNonQueryAsync();
                    _logger.LogInformation("✅ Registro actualizado: {Articulo}", createDto.Articulo);
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

                    await insertCommand.ExecuteNonQueryAsync();
                    _logger.LogInformation("✅ Registro creado: {Articulo}", createDto.Articulo);
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

                // Eliminar programas en estado CORRIENDO antes de cargar nuevos
                // NOTA: Comentado temporalmente debido a problemas con Entity Framework
                // _logger.LogInformation("🗑️ Eliminando programas en estado CORRIENDO antes de cargar nuevos...");
                // var allPrograms = await _repository.GetAllAsync();
                // var runningPrograms = allPrograms.Where(p => p.Estado == "CORRIENDO").ToList();
                // foreach (var runningProgram in runningPrograms)
                // {
                //     await _repository.DeleteAsync(runningProgram.Articulo);
                //     _logger.LogInformation("🗑️ Programa eliminado: {Articulo} - Máquina {Machine}", runningProgram.Articulo, runningProgram.NumeroMaquina);
                // }

                // Procesar archivo Excel usando EPPlus
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
            var columns = ParseCsvLine(line);
            
            // ===== LOG DE INFORMACIÓN DE LA LÍNEA =====
            // Registrar cuántas columnas se encontraron en esta línea
            _logger.LogInformation("📋 Procesando línea con {Count} columnas", columns.Count);
            // Registrar el contenido de cada columna con su índice para debugging
            _logger.LogInformation("📋 Datos: {Data}", string.Join(" | ", columns.Select((c, i) => $"[{i}]={c}")));
            
            // ===== VALIDACIÓN: VERIFICAR NÚMERO MÍNIMO DE COLUMNAS =====
            // El archivo debe tener al menos 11 columnas para ser válido según el nuevo formato
            // Si tiene menos, lanzar excepción con mensaje detallado
            if (columns.Count < 11)
            {
                // Construir mensaje de error detallado con la lista de columnas esperadas
                var errorMsg = $"Formato inválido: Se esperan al menos 11 columnas, se encontraron {columns.Count}.\n" +
                              $"Columnas esperadas:\n" +
                              $"1. MQ IMP (Número de máquina impresora)\n" +
                              $"2. ARTICULO F (Código del artículo)\n" +
                              $"3. OT SAP (Orden de trabajo)\n" +
                              $"4. CLIENTE (Nombre del cliente)\n" +
                              $"5. REFERENCIA (Referencia del producto)\n" +
                              $"6. TD (Tipo de diseño)\n" +
                              $"7. NUMERO DE COLORES (Cantidad de colores)\n" +
                              $"8. KILOS (Cantidad en kilogramos)\n" +
                              $"9. COLORES EN MAQUINA (Lista de colores separados por coma)\n" +
                              $"10. FECHA DE TINTAS EN MAQUINA (Fecha y hora)\n" +
                              $"11. SUSTRATOS (Tipo de material)";
                throw new ArgumentException(errorMsg);
            }
            
            // ===== VALIDACIÓN DE CAMPOS OBLIGATORIOS =====
            // Verificar que los campos críticos no estén vacíos
            if (string.IsNullOrWhiteSpace(columns[1]))
            {
                throw new ArgumentException("El campo ARTICULO F (columna 2) es obligatorio y no puede estar vacío");
            }
            
            if (string.IsNullOrWhiteSpace(columns[2]))
            {
                throw new ArgumentException("El campo OT SAP (columna 3) es obligatorio y no puede estar vacío");
            }
            
            if (string.IsNullOrWhiteSpace(columns[3]))
            {
                throw new ArgumentException("El campo CLIENTE (columna 4) es obligatorio y no puede estar vacío");
            }

            // ===== FORMATO ACTUALIZADO DEL ARCHIVO (11 COLUMNAS) =====
            // Columna 0: MQ IMP - Número de máquina impresora (11-21)
            // Columna 1: ARTICULO F - Código del artículo (único, clave primaria)
            // Columna 2: OT SAP - Orden de trabajo SAP
            // Columna 3: CLIENTE - Nombre del cliente
            // Columna 4: REFERENCIA - Referencia del producto
            // Columna 5: TD - Código TD (Tipo de Diseño)
            // Columna 6: NUMERO DE COLORES - Cantidad de colores (1-10)
            // Columna 7: KILOS - Cantidad en kilogramos
            // Columna 8: COLORES EN MAQUINA - Lista de colores reales separados por coma (ej: "CYAN,MAGENTA,AMARILLO")
            // Columna 9: FECHA DE TINTAS EN MAQUINA - Fecha y hora cuando se aplicó la tinta
            // Columna 10: SUSTRATOS - Tipo de material base (ej: BOPP, PE, PET)

            // ===== PARSEAR NÚMERO DE MÁQUINA (COLUMNA 0) =====
            int numeroMaquina = 11; // Valor por defecto
            if (int.TryParse(columns[0], out var machine))
            {
                numeroMaquina = machine;
                _logger.LogInformation("🖨️ Máquina impresora: {Machine}", numeroMaquina);
            }
            else
            {
                _logger.LogWarning("⚠️ No se pudo parsear número de máquina '{Machine}', usando 11 por defecto", columns[0]);
            }

            // ===== PARSEAR NÚMERO DE COLORES (COLUMNA 6) =====
            int numeroColores = 0;
            if (int.TryParse(columns[6], out var numCol))
            {
                numeroColores = numCol;
                _logger.LogInformation("🎨 Número de colores: {Count}", numeroColores);
            }
            else
            {
                _logger.LogWarning("⚠️ No se pudo parsear número de colores '{NumColores}', usando 0", columns[6]);
            }

            // ===== PARSEAR COLORES EN MÁQUINA (COLUMNA 8) =====
            // Los colores vienen separados por coma en una sola celda (ej: "CYAN,MAGENTA,AMARILLO")
            var colores = new List<string>();
            if (!string.IsNullOrWhiteSpace(columns[8]))
            {
                // Dividir por coma y limpiar espacios
                colores = columns[8]
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(c => c.Trim())
                    .Where(c => !string.IsNullOrWhiteSpace(c))
                    .ToList();
                
                _logger.LogInformation("🎨 Colores parseados: {Colores}", string.Join(", ", colores));
            }
            else
            {
                // Si no hay colores especificados, crear lista genérica basada en el número
                for (int i = 0; i < numeroColores; i++)
                {
                    colores.Add($"COLOR{i + 1}");
                }
                _logger.LogWarning("⚠️ No se especificaron colores, usando nombres genéricos: {Colores}", string.Join(", ", colores));
            }

            // ===== PARSEAR KILOS (COLUMNA 7) =====
            // Manejar formato con coma y punto decimal
            decimal kilos = 0;
            _logger.LogInformation("🔍 Parseando kilos - Valor original: '{Kilos}' (columna 8)", columns[7]);
            
            if (!string.IsNullOrWhiteSpace(columns[7]))
            {
                var kilosStr = columns[7]
                    .Replace(",", ".") // Reemplazar coma por punto para formato decimal
                    .Replace(" ", "")  // Eliminar espacios
                    .Trim();
                
                _logger.LogInformation("🔍 Kilos después de limpieza: '{KilosLimpio}'", kilosStr);
                
                if (decimal.TryParse(kilosStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out kilos))
                {
                    _logger.LogInformation("✅ Kilos parseados exitosamente: {Kilos}", kilos);
                }
                else
                {
                    _logger.LogWarning("⚠️ No se pudo parsear kilos '{Kilos}', usando 0", columns[7]);
                    kilos = 0;
                }
            }
            else
            {
                _logger.LogWarning("⚠️ Columna de kilos vacía (columna 8), usando 0");
                kilos = 0;
            }

            // ===== PARSEAR FECHA DE TINTA EN MÁQUINA (COLUMNA 9) =====
            DateTime? fechaTintaEnMaquina = null;
            if (!string.IsNullOrWhiteSpace(columns[9]))
            {
                if (DateTime.TryParse(columns[9], out var fecha))
                {
                    fechaTintaEnMaquina = fecha;
                    _logger.LogInformation("📅 Fecha parseada: {Fecha}", fechaTintaEnMaquina);
                }
                else
                {
                    fechaTintaEnMaquina = DateTime.Now;
                    _logger.LogWarning("⚠️ No se pudo parsear la fecha '{Fecha}', usando fecha actual", columns[9]);
                }
            }
            else
            {
                fechaTintaEnMaquina = DateTime.Now;
                _logger.LogWarning("⚠️ Fecha vacía, usando fecha actual");
            }

            // ===== CREAR DTO CON LOS DATOS PROCESADOS =====
            // IMPORTANTE: Los programas nuevos se cargan SIN ESTADO (vacío)
            // El operario debe aplicar la primera acción (PREPARANDO, LISTO, etc.)
            var createDto = new CreateMaquinaDto
            {
                NumeroMaquina = numeroMaquina,           // Columna 0: MQ IMP
                Articulo = columns[1],                   // Columna 1: ARTICULO F
                OtSap = columns[2],                      // Columna 2: OT SAP
                Cliente = columns[3],                    // Columna 3: CLIENTE
                Referencia = columns[4],                 // Columna 4: REFERENCIA
                Td = columns[5],                         // Columna 5: TD
                Colores = colores,                       // Columna 8: COLORES EN MAQUINA (parseados)
                Kilos = kilos,                           // Columna 7: KILOS (parseados)
                FechaTintaEnMaquina = fechaTintaEnMaquina, // Columna 9: FECHA DE TINTAS EN MAQUINA
                Sustrato = columns[10],                  // Columna 10: SUSTRATOS
                Estado = "", // SIN ESTADO - El operario debe aplicar la primera acción
                Observaciones = "Programa nuevo - Pendiente de asignación de estado por operario"
            };

            _logger.LogInformation("✅ DTO creado: Máquina={Machine}, Artículo={Articulo}, OT={OT}, Cliente={Cliente}, Kilos={Kilos}, Colores={Colores}", 
                createDto.NumeroMaquina, createDto.Articulo, createDto.OtSap, createDto.Cliente, createDto.Kilos, string.Join(",", createDto.Colores));

            return await CreateAsync(createDto, userId);
        }

        private List<string> ParseCsvLine(string line)
        {
            var columns = new List<string>();
            var currentColumn = new System.Text.StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

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

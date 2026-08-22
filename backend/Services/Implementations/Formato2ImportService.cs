using ClosedXML.Excel;
using FlexoAPP.API.Helpers;

namespace FlexoAPP.API.Services.Implementations
{
    public class Formato2ImportService
    {
        private readonly ILogger _logger;

        public Formato2ImportService(ILogger logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Importa programación desde Excel formato Planta 2, aplicando las mismas protecciones
        /// que la importación normal (backup, preservación de estados, transacciones, orden).
        /// </summary>
        public async Task<Formato2Result> ImportAsync(Stream fileStream, string connectionString)
        {
            var result = new Formato2Result();

            try
            {
                using var workbook = new XLWorkbook(fileStream);
                var worksheet = workbook.Worksheets.First();

                // Encontrar encabezados — buscar en las primeras 5 filas por si hay filas vacías arriba
                var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                int headerRowNum = 1;

                for (int tryRow = 1; tryRow <= 5; tryRow++)
                {
                    var testCell = worksheet.Cell(tryRow, 1).GetString().Trim();
                    if (!string.IsNullOrEmpty(testCell))
                    {
                        headerRowNum = tryRow;
                        break;
                    }
                }

                var lastCol = worksheet.LastColumnUsed()?.ColumnNumber() ?? 1;
                for (int col = 1; col <= lastCol; col++)
                {
                    var header = worksheet.Cell(headerRowNum, col).GetString().Trim();
                    if (!string.IsNullOrEmpty(header) && !headers.ContainsKey(header))
                        headers[header] = col;
                }

                _logger.LogInformation("📋 Formato 2: {Count} columnas detectadas: {Headers}",
                    headers.Count, string.Join(", ", headers.Keys.Take(10)));

                // Buscar columna Maquina con variaciones
                int colMaquina = FindColumn(headers, "Maquina", "Máquina", "MAQUINA");
                int colPlanta = FindColumn(headers, "Planta", "PLANTA");

                if (colMaquina == 0)
                {
                    result.Error = $"No se encontró la columna 'Maquina'. Columnas disponibles: {string.Join(", ", headers.Keys)}";
                    return result;
                }

                // Mapeo flexible de columnas
                int colArticulo = FindColumn(headers, "ArticuloF", "Articulo F", "ARTICULOF");
                int colCliente = FindColumn(headers, "Cliente", "CLIENTE");
                int colNombre = FindColumn(headers, "Nombre Articulo", "Nombre_Articulo", "NOMBRE ARTICULO");
                int colTipoApro = FindColumn(headers, "Tipo Aprobación", "Tipo Aprobacion", "TIPO APROBACION");
                int colTImpresion = FindColumn(headers, "T Impresión", "T Impresion", "T_IMPRESION", "T IMP");
                int colCantProducir = FindColumn(headers, "Cant Producir", "CANT PRODUCIR", "Cant_Producir");
                int colOT = FindColumn(headers, "OT", "OT SAP");
                int colInicio = FindColumn(headers, "INICIO", "Inicio", "FECHA INICIO");
                int colMetros = FindColumn(headers, "METROS", "Metros");
                int colRodillo = FindColumn(headers, "RODILLO", "Rodillo");

                _logger.LogInformation("📋 Mapeo: Maq={M}, Art={A}, OT={O}, Planta={P}, Cliente={C}",
                    colMaquina, colArticulo, colOT, colPlanta, colCliente);

                // ===== PROCESAR FILAS DEL EXCEL =====
                var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? 1;
                var parsedRows = new List<ParsedRow>();
                var processedOts = new HashSet<string>();

                for (int row = headerRowNum + 1; row <= lastRow; row++)
                {
                    try
                    {
                        // Filtro: Solo PLANTA 2 (o si no hay columna planta, incluir todo)
                        if (colPlanta > 0)
                        {
                            var planta = worksheet.Cell(row, colPlanta).GetString().Trim();
                            if (!planta.Contains("2"))
                                continue;
                        }

                        // Filtro: Solo máquinas 11-21
                        var maquinaStr = colMaquina > 0 ? worksheet.Cell(row, colMaquina).GetString().Trim() : "";
                        var numMaquina = ExtractMachineNumber(maquinaStr);
                        if (numMaquina < 11 || numMaquina > 21)
                            continue;

                        var articulo = colArticulo > 0 ? worksheet.Cell(row, colArticulo).GetString().Trim() : "";
                        var otSap = colOT > 0 ? worksheet.Cell(row, colOT).GetString().Trim() : "";

                        // Saltar filas vacías
                        if (string.IsNullOrEmpty(articulo) && string.IsNullOrEmpty(otSap))
                            continue;

                        // Generar OT si está vacía
                        if (string.IsNullOrEmpty(otSap))
                            otSap = $"F2-{numMaquina}-{row}";

                        // Verificar duplicados en el Excel
                        if (processedOts.Contains(otSap))
                        {
                            result.TotalErrors++;
                            result.ErrorDetails.Add($"Fila {row}: OT {otSap} duplicada en Excel");
                            continue;
                        }
                        processedOts.Add(otSap);

                        parsedRows.Add(new ParsedRow
                        {
                            NumeroMaquina = numMaquina,
                            Articulo = articulo,
                            OtSap = otSap,
                            Cliente = colCliente > 0 ? worksheet.Cell(row, colCliente).GetString().Trim() : "",
                            Referencia = colNombre > 0 ? worksheet.Cell(row, colNombre).GetString().Trim() : "",
                            Td = colTipoApro > 0 ? worksheet.Cell(row, colTipoApro).GetString().Trim() : "",
                            TipoImpresion = colTImpresion > 0 ? worksheet.Cell(row, colTImpresion).GetString().Trim() : null,
                            Kilos = ParseDecimal(colCantProducir > 0 ? worksheet.Cell(row, colCantProducir).GetString() : "0"),
                            Metros = ParseDecimalNullable(colMetros > 0 ? worksheet.Cell(row, colMetros).GetString() : null),
                            FechaTintaEnMaquina = ParseDate(colInicio > 0 ? worksheet.Cell(row, colInicio).GetString() : ""),
                            RowNumber = row
                        });

                        result.TotalRead++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("⚠️ Error en fila {Row}: {Error}", row, ex.Message);
                        result.TotalErrors++;
                        result.ErrorDetails.Add($"Fila {row}: {ex.Message}");
                    }
                }

                if (parsedRows.Count == 0)
                {
                    _logger.LogWarning("⚠️ No se encontraron filas válidas para importar");
                    return result;
                }

                // ===== OPERACIONES EN BASE DE DATOS CON TRANSACCIÓN =====
                using var conn = new MySqlConnector.MySqlConnection(connectionString);
                await conn.OpenAsync();

                // Verificar si existe columna orden_excel
                using var checkColCmd = conn.CreateCommand();
                checkColCmd.CommandText = @"SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'maquinas' AND COLUMN_NAME = 'orden_excel'";
                var hasOrdenExcel = Convert.ToInt32(await checkColCmd.ExecuteScalarAsync()) > 0;

                // Cargar programas protegidos (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO) para máquinas 11-21
                var protectedPrograms = new Dictionary<string, (string estado, string? observaciones, string? lastActionBy, DateTime? lastActionAt, DateTime? preparandoStartedAt)>();
                {
                    using var loadCmd = conn.CreateCommand();
                    loadCmd.CommandText = @"SELECT ot_sap, estado, observaciones, last_action_by, last_action_at, preparando_started_at 
                        FROM maquinas 
                        WHERE estado IN ('PREPARANDO','LISTO','CORRIENDO','SUSPENDIDO') 
                        AND numero_maquina BETWEEN 11 AND 21";
                    using var loadReader = await loadCmd.ExecuteReaderAsync();
                    while (await loadReader.ReadAsync())
                    {
                        var ot = loadReader.GetString("ot_sap");
                        protectedPrograms[ot] = (
                            loadReader.GetString("estado"),
                            loadReader.IsDBNull(loadReader.GetOrdinal("observaciones")) ? null : loadReader.GetString("observaciones"),
                            loadReader.IsDBNull(loadReader.GetOrdinal("last_action_by")) ? null : loadReader.GetString("last_action_by"),
                            loadReader.IsDBNull(loadReader.GetOrdinal("last_action_at")) ? (DateTime?)null : loadReader.GetDateTime("last_action_at"),
                            loadReader.IsDBNull(loadReader.GetOrdinal("preparando_started_at")) ? (DateTime?)null : loadReader.GetDateTime("preparando_started_at")
                        );
                    }
                }
                _logger.LogDebug($"🛡️ {protectedPrograms.Count} programas con estados protegidos encontrados (máquinas 11-21)");

                // Iniciar transacción
                using var transaction = await conn.BeginTransactionAsync();

                try
                {
                    // ===== LIMPIEZA: Solo TERMINADOS y SIN_ASIGNAR para máquinas 11-21 =====
                    _logger.LogDebug("🧹 Eliminando solo programas TERMINADOS y SIN_ASIGNAR (máquinas 11-21)...");

                    using var delTermCmd = conn.CreateCommand();
                    delTermCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;
                    delTermCmd.CommandText = "DELETE FROM maquinas WHERE numero_maquina BETWEEN 11 AND 21 AND estado = 'TERMINADO'";
                    var countTerminados = await delTermCmd.ExecuteNonQueryAsync();

                    using var delSinCmd = conn.CreateCommand();
                    delSinCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;
                    delSinCmd.CommandText = "DELETE FROM maquinas WHERE numero_maquina BETWEEN 11 AND 21 AND (estado IS NULL OR estado = '' OR estado = 'SIN_ASIGNAR')";
                    var countSinAsignar = await delSinCmd.ExecuteNonQueryAsync();

                    _logger.LogDebug($"🗑️ Eliminados: {countTerminados} TERMINADOS, {countSinAsignar} SIN_ASIGNAR");

                    // Resetear orden_excel de protegidos
                    if (hasOrdenExcel)
                    {
                        using var resetCmd = conn.CreateCommand();
                        resetCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;
                        resetCmd.CommandText = "UPDATE maquinas SET orden_excel = 0 WHERE numero_maquina BETWEEN 11 AND 21 AND estado IN ('PREPARANDO','LISTO','CORRIENDO','SUSPENDIDO')";
                        await resetCmd.ExecuteNonQueryAsync();
                    }

                    // Cargar OTs existentes DESPUÉS del DELETE (para saber cuáles sobrevivieron)
                    var existingOts = new HashSet<string>();
                    {
                        using var existCmd = conn.CreateCommand();
                        existCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;
                        existCmd.CommandText = "SELECT ot_sap FROM maquinas WHERE numero_maquina BETWEEN 11 AND 21";
                        using var existReader = await existCmd.ExecuteReaderAsync();
                        while (await existReader.ReadAsync())
                        {
                            existingOts.Add(existReader.GetString("ot_sap"));
                        }
                    }
                    _logger.LogDebug($"📋 {existingOts.Count} OTs existentes después de limpieza (solo protegidos)");

                    // ===== INSERTAR/ACTUALIZAR FILAS DEL EXCEL =====
                    int ordenExcel = 1;
                    var machinesAffected = new HashSet<int>();

                    foreach (var row in parsedRows)
                    {
                        try
                        {
                            var currentOrden = ordenExcel++;
                            machinesAffected.Add(row.NumeroMaquina);

                            bool isUpdate = existingOts.Contains(row.OtSap);
                            bool isProtected = protectedPrograms.ContainsKey(row.OtSap);

                            if (isUpdate)
                            {
                                using var updateCmd = conn.CreateCommand();
                                updateCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;

                                if (isProtected)
                                {
                                    // UPDATE preservando estado y metadatos de acción
                                    var ordenCol = hasOrdenExcel ? ", orden_excel = @orden" : "";
                                    updateCmd.CommandText = $@"UPDATE maquinas SET 
                                        numero_maquina = @mq, articulo = @art, cliente = @cli, referencia = @ref, 
                                        td = @td, tipo_impresion = @tipoImp, numero_colores = 0, colores = '[]',
                                        kilos = @kilos, metros = @metros, fecha_tinta_en_maquina = @fecha, sustrato = '',
                                        updated_at = @updAt{ordenCol}
                                        WHERE ot_sap = @ot";
                                }
                                else
                                {
                                    // UPDATE reseteando estado
                                    var ordenCol = hasOrdenExcel ? ", orden_excel = @orden" : "";
                                    updateCmd.CommandText = $@"UPDATE maquinas SET 
                                        numero_maquina = @mq, articulo = @art, cliente = @cli, referencia = @ref, 
                                        td = @td, tipo_impresion = @tipoImp, numero_colores = 0, colores = '[]',
                                        kilos = @kilos, metros = @metros, fecha_tinta_en_maquina = @fecha, sustrato = '',
                                        estado = NULL, updated_at = @updAt{ordenCol}
                                        WHERE ot_sap = @ot";
                                }

                                updateCmd.Parameters.AddWithValue("@ot", row.OtSap);
                                updateCmd.Parameters.AddWithValue("@mq", row.NumeroMaquina);
                                updateCmd.Parameters.AddWithValue("@art", row.Articulo);
                                updateCmd.Parameters.AddWithValue("@cli", row.Cliente);
                                updateCmd.Parameters.AddWithValue("@ref", row.Referencia ?? "");
                                updateCmd.Parameters.AddWithValue("@td", row.Td ?? "");
                                updateCmd.Parameters.AddWithValue("@tipoImp", (object?)row.TipoImpresion ?? DBNull.Value);
                                updateCmd.Parameters.AddWithValue("@kilos", row.Kilos);
                                updateCmd.Parameters.AddWithValue("@metros", (object?)row.Metros ?? DBNull.Value);
                                updateCmd.Parameters.AddWithValue("@fecha", row.FechaTintaEnMaquina);
                                updateCmd.Parameters.AddWithValue("@updAt", DateTimeHelper.Now);
                                if (hasOrdenExcel) updateCmd.Parameters.AddWithValue("@orden", currentOrden);

                                await updateCmd.ExecuteNonQueryAsync();
                                result.TotalUpdated++;
                            }
                            else
                            {
                                // INSERT nuevo programa
                                using var insertCmd = conn.CreateCommand();
                                insertCmd.Transaction = transaction as MySqlConnector.MySqlTransaction;

                                var ordenInsertCol = hasOrdenExcel ? ", orden_excel" : "";
                                var ordenInsertVal = hasOrdenExcel ? ", @orden" : "";
                                insertCmd.CommandText = $@"INSERT INTO maquinas 
                                    (ot_sap, articulo, numero_maquina, cliente, referencia, td, tipo_impresion, 
                                     numero_colores, colores, kilos, metros, fecha_tinta_en_maquina, sustrato, 
                                     estado, observaciones, created_at, updated_at, created_by, updated_by{ordenInsertCol})
                                    VALUES 
                                    (@ot, @art, @mq, @cli, @ref, @td, @tipoImp, 
                                     0, '[]', @kilos, @metros, @fecha, '', 
                                     NULL, '', @creAt, @updAt, 1, 1{ordenInsertVal})";

                                insertCmd.Parameters.AddWithValue("@ot", row.OtSap);
                                insertCmd.Parameters.AddWithValue("@art", row.Articulo);
                                insertCmd.Parameters.AddWithValue("@mq", row.NumeroMaquina);
                                insertCmd.Parameters.AddWithValue("@cli", row.Cliente);
                                insertCmd.Parameters.AddWithValue("@ref", row.Referencia ?? "");
                                insertCmd.Parameters.AddWithValue("@td", row.Td ?? "");
                                insertCmd.Parameters.AddWithValue("@tipoImp", (object?)row.TipoImpresion ?? DBNull.Value);
                                insertCmd.Parameters.AddWithValue("@kilos", row.Kilos);
                                insertCmd.Parameters.AddWithValue("@metros", (object?)row.Metros ?? DBNull.Value);
                                insertCmd.Parameters.AddWithValue("@fecha", row.FechaTintaEnMaquina);
                                insertCmd.Parameters.AddWithValue("@creAt", DateTimeHelper.Now);
                                insertCmd.Parameters.AddWithValue("@updAt", DateTimeHelper.Now);
                                if (hasOrdenExcel) insertCmd.Parameters.AddWithValue("@orden", currentOrden);

                                await insertCmd.ExecuteNonQueryAsync();
                                result.TotalCreated++;
                            }
                        }
                        catch (Exception ex)
                        {
                            result.TotalErrors++;
                            result.ErrorDetails.Add($"Fila {row.RowNumber}: {ex.Message}");
                            _logger.LogError($"❌ Fila {row.RowNumber}: {ex.Message}");
                        }
                    }

                    // Commit de la transacción
                    await transaction.CommitAsync();
                    result.MachinesProcessed = machinesAffected.Count;
                    _logger.LogInformation("✅ Formato 2 importado: {Created} creados, {Updated} actualizados, {Errors} errores, {Machines} máquinas",
                        result.TotalCreated, result.TotalUpdated, result.TotalErrors, result.MachinesProcessed);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    var innerMsg = ex.InnerException?.Message ?? "sin detalle";
                    _logger.LogError(ex, $"❌ FALLO TRANSACCIÓN formato 2: {ex.Message} | Inner: {innerMsg}");
                    result.TotalCreated = 0;
                    result.TotalUpdated = 0;
                    result.TotalErrors++;
                    result.ErrorDetails.Add($"FALLO TOTAL: {ex.Message} | {innerMsg}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno procesando formato 2");
                result.Error = $"Error procesando el archivo: {ex.Message}";
            }

            return result;
        }

        private static int FindColumn(Dictionary<string, int> headers, params string[] names)
        {
            foreach (var name in names)
            {
                if (headers.TryGetValue(name, out var col))
                    return col;
            }
            return 0;
        }

        private static int ExtractMachineNumber(string maquinaStr)
        {
            // "IMPCOM0015" → últimos 2 dígitos = 15
            if (string.IsNullOrEmpty(maquinaStr) || maquinaStr.Length < 2) return 0;
            // Si es un número directo (ej: "15", "11")
            if (int.TryParse(maquinaStr.Trim(), out var directNum) && directNum >= 11 && directNum <= 21)
                return directNum;
            var lastTwo = maquinaStr.Substring(maquinaStr.Length - 2);
            if (int.TryParse(lastTwo, out var num)) return num;
            // Fallback: extraer todos los dígitos
            var digits = new string(maquinaStr.Where(char.IsDigit).ToArray());
            if (digits.Length >= 2 && int.TryParse(digits.Substring(digits.Length - 2), out var num2)) return num2;
            return 0;
        }

        private static decimal ParseDecimal(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return 0;
            var clean = value.Trim();
            if (clean.Contains(".") && clean.Contains(","))
                clean = clean.Replace(".", "").Replace(",", ".");
            else if (clean.Contains(","))
                clean = clean.Replace(",", ".");
            return decimal.TryParse(clean, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var result) ? Math.Min(result, 9999999.999m) : 0;
        }

        private static decimal? ParseDecimalNullable(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            var d = ParseDecimal(value);
            return d > 0 ? d : null;
        }

        private static DateTime ParseDate(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return DateTimeHelper.Now;
            // Intentar parseo como OA date (número de Excel)
            if (double.TryParse(value, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out double oaDate))
            {
                try { return DateTime.FromOADate(oaDate); } catch { }
            }
            // Intentar formatos comunes
            var formats = new[] {
                "dd/MM/yyyy HH:mm", "dd/MM/yyyy H:mm", "d/M/yyyy HH:mm", "d/M/yyyy H:mm",
                "dd/MM/yyyy", "d/M/yyyy", "M/d/yyyy HH:mm", "M/d/yyyy",
                "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM-dd"
            };
            if (DateTime.TryParseExact(value, formats,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var parsed))
                return parsed;
            if (DateTime.TryParse(value, out var date)) return date;
            return DateTimeHelper.Now;
        }

        /// <summary>Fila parseada del Excel antes de escribir a BD</summary>
        private class ParsedRow
        {
            public int NumeroMaquina { get; set; }
            public string Articulo { get; set; } = "";
            public string OtSap { get; set; } = "";
            public string Cliente { get; set; } = "";
            public string? Referencia { get; set; }
            public string? Td { get; set; }
            public string? TipoImpresion { get; set; }
            public decimal Kilos { get; set; }
            public decimal? Metros { get; set; }
            public DateTime FechaTintaEnMaquina { get; set; }
            public int RowNumber { get; set; }
        }
    }

    public class Formato2Result
    {
        public int TotalRead { get; set; }
        public int TotalCreated { get; set; }
        public int TotalUpdated { get; set; }
        public int TotalErrors { get; set; }
        public int MachinesProcessed { get; set; }
        public string? Error { get; set; }
        public List<string> ErrorDetails { get; set; } = new();
    }
}

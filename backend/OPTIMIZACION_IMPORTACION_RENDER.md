# Optimización de Importación para Render

## Problema Identificado
El error 500 en Render al importar Excel multisheet probablemente se debe a:
- Timeout de 30 segundos (plan Free)
- Límite de memoria de 512MB
- Procesamiento de muchas filas simultáneamente

## Solución: Procesamiento por Lotes

### Cambios Necesarios en MaquinasController.cs

Reemplazar el método `ProcessWorksheet` con una versión optimizada que:
1. Procesa filas en lotes de 25
2. Guarda cambios cada lote
3. Libera memoria entre lotes
4. Reporta progreso

```csharp
private async Task<ImportSheetResult> ProcessWorksheet(ExcelWorksheet worksheet, int machineNumber)
{
    var result = new ImportSheetResult();
    var rowCount = worksheet.Dimension?.Rows ?? 0;
    var processedOts = new HashSet<string>();
    var batchSize = 25; // Procesar 25 filas a la vez
    
    _logger.LogInformation($"📊 Procesando máquina {machineNumber}: {rowCount} filas en lotes de {batchSize}");

    // Procesar en lotes
    for (int startRow = 3; startRow <= rowCount; startRow += batchSize)
    {
        var endRow = Math.Min(startRow + batchSize - 1, rowCount);
        var batchNumber = ((startRow - 3) / batchSize) + 1;
        var totalBatches = (int)Math.Ceiling((rowCount - 2) / (double)batchSize);
        
        _logger.LogInformation($"📦 Máquina {machineNumber}: Procesando lote {batchNumber}/{totalBatches} (filas {startRow}-{endRow})");
        
        // Procesar lote
        await ProcessBatch(worksheet, machineNumber, startRow, endRow, result, processedOts);
        
        // Guardar cambios del lote
        try
        {
            await _context.SaveChangesAsync();
            _logger.LogDebug($"💾 Lote {batchNumber} guardado exitosamente");
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error guardando lote {batchNumber}: {ex.Message}");
            result.Errors += (endRow - startRow + 1);
        }
        
        // Liberar memoria
        if (batchNumber % 5 == 0) // Cada 5 lotes
        {
            GC.Collect();
            GC.WaitForPendingFinalizers();
            _logger.LogDebug($"🧹 Memoria liberada después de {batchNumber} lotes");
        }
    }
    
    return result;
}

private async Task ProcessBatch(
    ExcelWorksheet worksheet, 
    int machineNumber, 
    int startRow, 
    int endRow, 
    ImportSheetResult result,
    HashSet<string> processedOts)
{
    for (int row = startRow; row <= endRow; row++)
    {
        try
        {
            // ... código existente de procesamiento de fila ...
            // (mantener toda la lógica actual)
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error en fila {row}: {ex.Message}");
            result.Errors++;
            result.ErrorDetails.Add($"Fila {row}: {ex.Message}");
        }
    }
}
```

## Alternativa: Endpoint de Importación Asíncrona

Si el problema persiste, implementar un endpoint asíncrono:

```csharp
[HttpPost("import/excel-multisheet-async")]
public async Task<IActionResult> ImportFromExcelMultiSheetAsync(IFormFile file)
{
    // Guardar archivo temporalmente
    var tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.xlsx");
    using (var stream = new FileStream(tempPath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }
    
    // Crear job de importación
    var jobId = Guid.NewGuid().ToString();
    
    // Procesar en background
    _ = Task.Run(async () =>
    {
        try
        {
            await ProcessExcelFile(tempPath, jobId);
        }
        finally
        {
            File.Delete(tempPath);
        }
    });
    
    return Ok(new { jobId, message = "Importación iniciada" });
}

[HttpGet("import/status/{jobId}")]
public IActionResult GetImportStatus(string jobId)
{
    // Retornar estado del job
    // (implementar con cache o base de datos)
}
```

## Configuración de Render

### render.yaml
```yaml
services:
  - type: web
    name: flexoapp-backend
    env: dotnet
    plan: starter  # Recomendado para producción
    buildCommand: dotnet publish -c Release -o out
    startCommand: dotnet out/flexoAPP.dll
    envVars:
      - key: ASPNETCORE_URLS
        value: http://0.0.0.0:$PORT
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
    # Aumentar timeout (solo en planes pagos)
    healthCheckPath: /health
    autoDeploy: true
```

## Monitoreo

Agregar logs de memoria y tiempo:

```csharp
private async Task<IActionResult> ImportFromExcelMultiSheet(IFormFile file)
{
    var startTime = DateTime.Now;
    var startMemory = GC.GetTotalMemory(false);
    
    try
    {
        // ... código de importación ...
        
        var endTime = DateTime.Now;
        var endMemory = GC.GetTotalMemory(false);
        var duration = (endTime - startTime).TotalSeconds;
        var memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB
        
        _logger.LogInformation($"⏱️ Importación completada en {duration:F2}s, memoria usada: {memoryUsed:F2}MB");
    }
    catch (Exception ex)
    {
        _logger.LogError($"❌ Error después de {(DateTime.Now - startTime).TotalSeconds:F2}s");
        throw;
    }
}
```

## Recomendaciones

1. **Upgrade a plan Starter** ($7/mes) para:
   - 512MB RAM garantizados
   - Sin timeout de 30 segundos
   - Mejor rendimiento

2. **Dividir archivos grandes**:
   - Máximo 5-6 hojas por archivo
   - Máximo 100 filas por hoja

3. **Implementar cola de trabajos**:
   - Usar Hangfire o similar
   - Procesar importaciones en background

4. **Optimizar consultas**:
   - Usar bulk insert en lugar de SaveChanges por fila
   - Cargar diseños en memoria antes del loop

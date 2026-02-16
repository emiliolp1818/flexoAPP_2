# Cambios en Importación de Excel - Colores y Eliminación de Programas

## Fecha: 2026-02-15

## Problemas Corregidos

### 1. Número de Colores no se Mostraba Correctamente
**Problema**: El número de colores no se mostraba hasta hacer click y se borraba al recargar.

**Solución**: 
- Mejorado el parsing de la columna K (número de colores) en el backend
- Ahora intenta parsear como entero primero, y si falla, como decimal y lo convierte a entero
- Esto maneja casos donde Excel guarda el número como "5.0" en lugar de "5"
- Agregados logs detallados para debugging

**Archivo**: `backend/Controllers/MaquinasController.cs` (líneas ~1418-1437)

### 2. Colores de Diseño no se Cargaban Automáticamente
**Problema**: Los colores de la paleta no se cargaban automáticamente desde la tabla de diseño al importar.

**Solución**:
- Agregada lógica para buscar el diseño por artículo F en la tabla `designs`
- Se cargan automáticamente los colores (Color1 a Color10) del diseño
- Los colores se guardan en formato JSON en la columna `colores` de la tabla `maquinas`
- El campo `numero_colores` se actualiza con el conteo real de colores del diseño

**Archivo**: `backend/Controllers/MaquinasController.cs` (líneas ~1507-1530)

**Código agregado**:
```csharp
// ===== CARGAR COLORES DESDE TABLA DE DISEÑO =====
var design = await _context.Designs
    .Where(d => d.ArticleF == articulo)
    .FirstOrDefaultAsync();

var coloresArray = new List<string>();
if (design != null)
{
    // Construir lista de colores desde las columnas Color1 a Color10
    if (!string.IsNullOrWhiteSpace(design.Color1)) coloresArray.Add(design.Color1);
    // ... (Color2 a Color10)
    
    _logger.LogDebug($"🎨 Fila {row}: {coloresArray.Count} colores cargados desde diseño para artículo {articulo}");
}

// Serializar colores a JSON
var coloresJson = System.Text.Json.JsonSerializer.Serialize(coloresArray);

// Usar en el objeto Maquina
NumeroColores = coloresArray.Count,
Colores = coloresJson
```

### 3. Programas TERMINADOS no se Eliminaban al Importar
**Problema**: Al cargar nueva programación, los programas TERMINADOS no se eliminaban, solo se agregaban nuevos programas.

**Solución**:
- Agregada lógica para eliminar SOLO los programas con estado "TERMINADO" antes de importar
- Los programas con estados PREPARANDO, LISTO, SUSPENDIDO y CORRIENDO se mantienen intactos
- Esto preserva el trabajo del operario en programas activos

**Archivo**: `backend/Controllers/MaquinasController.cs` (líneas ~1288-1302)

**Código agregado**:
```csharp
// ===== ELIMINAR SOLO PROGRAMAS TERMINADOS =====
var programasTerminados = await _context.Maquinas
    .Where(m => m.Estado == "TERMINADO")
    .ToListAsync();

if (programasTerminados.Any())
{
    _context.Maquinas.RemoveRange(programasTerminados);
    await _context.SaveChangesAsync();
    _logger.LogInformation($"🗑️ {programasTerminados.Count} programas TERMINADOS eliminados antes de importar");
}
```

### 4. Frontend no Manejaba Correctamente la Respuesta del Backend
**Problema**: El frontend esperaba `{success: true, data: [...]}` pero el backend retornaba `{message, sheetsProcessed, totalCreated, totalErrors, results}`.

**Solución**:
- Actualizada la validación de respuesta en el frontend
- Cambiado de `if (response && response.success)` a `if (response && response.message === 'Importación completada')`
- Actualizado el mensaje de éxito para mostrar estadísticas detalladas
- Eliminada lógica innecesaria de combinación de programas

**Archivo**: `Frontend/src/app/shared/components/machines/machines.ts` (líneas ~1842-1900)

## Flujo de Importación Actualizado

1. **Usuario selecciona archivo Excel** (máximo 500MB)
2. **Backend elimina programas TERMINADOS** (mantiene PREPARANDO, LISTO, SUSPENDIDO, CORRIENDO)
3. **Backend procesa cada hoja** (MAQ 11, MAQ 12, ..., MAQ 21)
4. **Para cada fila válida**:
   - Lee datos de las columnas especificadas
   - **Busca el diseño por artículo F**
   - **Carga colores desde diseño (Color1-Color10)**
   - Crea registro con colores en formato JSON
   - Guarda en base de datos
5. **Frontend recibe respuesta** con estadísticas
6. **Frontend recarga programas** desde base de datos
7. **Usuario ve programas** con colores cargados automáticamente

## Estados de Programas

- **PENDIENTE**: Programa recién importado, sin asignar
- **PREPARANDO**: Operario está preparando la máquina
- **LISTO**: Máquina lista para correr (color verde)
- **CORRIENDO**: Máquina en producción (color amarillo)
- **SUSPENDIDO**: Producción suspendida temporalmente (color rojo)
- **TERMINADO**: Producción completada (color gris) - **SE ELIMINA AL IMPORTAR**

## Logs Agregados

- `📊 Fila X: Número de colores convertido de decimal Y a Z`
- `🎨 Fila X: N colores cargados desde diseño para artículo ABC`
- `⚠️ Fila X: No se encontró diseño para artículo ABC, usando array vacío`
- `📝 Fila X: OT=ABC, Colores=N, Kilos=X, Metros=Y`
- `🗑️ N programas TERMINADOS eliminados antes de importar`

## Próximos Pasos

1. **Reiniciar el backend** para aplicar los cambios
2. **Probar importación** con archivo Excel de 22MB
3. **Verificar logs** en `backend/logs/flexoapp-20260215.log`
4. **Confirmar** que:
   - Los colores se cargan automáticamente desde diseño
   - El número de colores se muestra correctamente
   - Los programas TERMINADOS se eliminan al importar
   - Los programas activos (PREPARANDO, LISTO, etc.) se mantienen

## Notas Técnicas

- El backend usa `System.Text.Json.JsonSerializer` para serializar colores
- La búsqueda de diseño usa `ArticleF` como clave
- Los colores se guardan en la columna `colores` (tipo JSON/TEXT)
- El campo `numero_colores` se actualiza automáticamente con el conteo real

# Corrección: Importación de Programación para Máquinas 13-21

## Problema Identificado

Las máquinas 13-21 no estaban subiendo la programación correctamente. El análisis de los logs reveló el siguiente error:

```
System.InvalidOperationException: The instance of entity type 'Maquina' cannot be tracked 
because another instance with the key value '{OtSap: 344866}' is already being tracked.
```

### Estadísticas del Error
- **Máquina 21**: 0 registros creados, 94 errores
- **Total**: 11 hojas procesadas, 0 registros creados, 731 errores

## Causa Raíz

El método `ProcessWorksheet` en `MaquinasController.cs` tenía un problema crítico con el **Change Tracker de Entity Framework**:

1. **Conflicto de Rastreo**: Entity Framework estaba intentando rastrear múltiples instancias de la misma entidad (con la misma clave primaria OtSap) durante el procesamiento del loop.

2. **Falta de Limpieza del Contexto**: Después de cada operación de guardado, el contexto no se limpiaba, causando que las entidades anteriores permanecieran en el tracker.

3. **Consultas con Tracking**: Las consultas de verificación (`AnyAsync`) estaban usando tracking innecesariamente, agregando más carga al Change Tracker.

## Soluciones Implementadas

### 1. Uso de `AsNoTracking()` en Consultas de Verificación

**Antes:**
```csharp
var existeOt = await _context.Maquinas
    .AnyAsync(m => m.OtSap == otSap);
```

**Después:**
```csharp
var existeOt = await _context.Maquinas
    .AsNoTracking()
    .AnyAsync(m => m.OtSap == otSap);
```

**Beneficio**: Evita que Entity Framework rastree entidades que solo se usan para verificación.

### 2. Uso de `AsNoTracking()` en Consultas de Diseño

**Antes:**
```csharp
var design = await _context.Designs
    .Where(d => d.ArticleF == articulo)
    .FirstOrDefaultAsync();
```

**Después:**
```csharp
var design = await _context.Designs
    .AsNoTracking()
    .Where(d => d.ArticleF == articulo)
    .FirstOrDefaultAsync();
```

**Beneficio**: Evita rastrear entidades de diseño que solo se usan para lectura.

### 3. Limpieza del Change Tracker Después de Cada Operación

**Después de Guardado Exitoso:**
```csharp
_context.Maquinas.Add(maquina);
await _context.SaveChangesAsync();

// CRÍTICO: Limpiar el contexto después de guardar
_context.ChangeTracker.Clear();

result.Created++;
```

**Después de Error:**
```csharp
catch (Exception ex)
{
    result.Errors++;
    var errorMsg = $"Fila {row}: {ex.Message}";
    result.ErrorDetails.Add(errorMsg);
    _logger.LogError(ex, $"❌ Error procesando fila {row}");
    
    // CRÍTICO: Limpiar el contexto también en caso de error
    _context.ChangeTracker.Clear();
}
```

**Beneficio**: Asegura que cada fila del Excel se procese de forma independiente sin interferencias del Change Tracker.

### 4. Corrección del Estado Inicial

**Antes:**
```csharp
Estado = "PENDIENTE",
```

**Después:**
```csharp
Estado = null, // NULL por defecto - El operario debe asignar el estado
```

**Beneficio**: Mantiene consistencia con el diseño del sistema donde el estado debe ser asignado por el operario.

## Archivos Modificados

- `backend/Controllers/MaquinasController.cs`
  - Método: `ProcessWorksheet` (líneas 1415-1670)
  - Cambios: 4 modificaciones críticas

## Impacto Esperado

✅ **Antes**: 0 registros creados, 731 errores
✅ **Después**: Importación exitosa de todos los registros válidos

### Beneficios
1. **Eliminación de conflictos de rastreo**: Cada fila se procesa independientemente
2. **Mejor rendimiento**: Menos entidades en el Change Tracker
3. **Mayor estabilidad**: Los errores en una fila no afectan las siguientes
4. **Logs más claros**: Errores específicos por fila

## Pruebas Recomendadas

1. **Importar archivo Excel con múltiples hojas** (MAQ 11-21)
2. **Verificar que todas las máquinas reciban su programación**
3. **Revisar logs** para confirmar:
   - `✅ Máquina XX: N creados, 0 errores`
   - `✅ Importación completada: 11 hojas procesadas, N registros creados, 0 errores`

## Notas Técnicas

### ¿Por qué `ChangeTracker.Clear()`?

Entity Framework mantiene un registro de todas las entidades que ha cargado o modificado en el `ChangeTracker`. En un loop que procesa cientos de filas:

- **Sin Clear()**: El tracker acumula todas las entidades, causando:
  - Conflictos de clave primaria duplicada
  - Uso excesivo de memoria
  - Degradación del rendimiento

- **Con Clear()**: Cada iteración comienza con un tracker limpio:
  - Sin conflictos de rastreo
  - Uso de memoria constante
  - Rendimiento óptimo

### ¿Por qué `AsNoTracking()`?

Para consultas de solo lectura (verificaciones, búsquedas), no necesitamos que Entity Framework rastree las entidades:

- **Con Tracking**: EF mantiene una copia de la entidad en memoria
- **Sin Tracking**: EF solo retorna los datos sin mantener referencias

## Fecha de Corrección

15 de febrero de 2026

## Estado

✅ **CORREGIDO** - Listo para pruebas

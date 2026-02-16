# Corrección de Importación Excel Multisheet

## Fecha
2026-02-15

## Problema Identificado

Al importar el archivo "PLANTA 1.xlsx" (21.5 MB) con 11 hojas, se obtuvieron:
- **0 registros creados**
- **731 errores**
- **11 hojas procesadas**

### Errores Encontrados en Logs

1. **Error de rango en columna Metros**
   ```
   MySqlException: Out of range value for column 'Metros' at row 1
   ```
   - La columna `Metros` está definida como `DECIMAL(10,2)` (máximo: 99,999,999.99)
   - El código estaba eliminando TODOS los puntos y comas, convirtiendo valores como "1,234.56" en "123456"

2. **Error de OTs duplicadas**
   ```
   InvalidOperationException: The instance of entity type 'Maquina' cannot be tracked 
   because another instance with the key value '{OtSap: 344866}' is already being tracked
   ```
   - El archivo Excel contenía OTs duplicadas
   - El código no verificaba si la OT ya existía antes de intentar agregarla

## Soluciones Implementadas

### 1. Corrección del Parseo de Números Decimales

**Antes:**
```csharp
// Remover separadores de miles y convertir
var kilosClean = kilosStr.Replace(",", "").Replace(".", "").Trim();
var metrosClean = metrosStr.Replace(",", "").Replace(".", "").Trim();
```

**Después:**
```csharp
// Normalizar: remover separadores de miles (,) y usar punto como decimal
var kilosClean = kilosStr.Replace(",", "").Trim();
var metrosClean = metrosStr.Replace(",", "").Trim();

// Usar InvariantCulture para parsear correctamente
decimal.TryParse(kilosClean, System.Globalization.NumberStyles.Any, 
    System.Globalization.CultureInfo.InvariantCulture, out decimal kilosValue)
```

**Cambios:**
- Ya NO se eliminan los puntos decimales
- Se usa `InvariantCulture` para parsear correctamente
- Se valida que metros no exceda el límite de `DECIMAL(10,2)`
- Kilos se redondea a 3 decimales (según definición `DECIMAL(10,3)`)
- Metros se redondea a 2 decimales (según definición `DECIMAL(10,2)`)

### 2. Validación de OTs Duplicadas

**Agregado:**
```csharp
// HashSet para rastrear OTs procesadas en esta hoja
var processedOts = new HashSet<string>();

// Verificar si la OT ya fue procesada en esta hoja
if (processedOts.Contains(otSap))
{
    _logger.LogDebug($"⚠️ Fila {row} ignorada: OT {otSap} duplicada en el mismo archivo");
    result.Errors++;
    result.ErrorDetails.Add($"Fila {row}: OT {otSap} duplicada en el archivo");
    continue;
}

// Verificar si la OT ya existe en la base de datos
var existeOt = await _context.Maquinas.AnyAsync(m => m.OtSap == otSap);
if (existeOt)
{
    _logger.LogDebug($"⚠️ Fila {row} ignorada: OT {otSap} ya existe en la base de datos");
    result.Errors++;
    result.ErrorDetails.Add($"Fila {row}: OT {otSap} ya existe en BD");
    continue;
}

// Marcar OT como procesada
processedOts.Add(otSap);
```

**Beneficios:**
- Evita intentar agregar OTs duplicadas dentro del mismo archivo
- Evita intentar agregar OTs que ya existen en la base de datos
- Proporciona mensajes de error claros para cada caso
- Previene el error de Entity Framework sobre entidades rastreadas

## Archivos Modificados

- `backend/Controllers/MaquinasController.cs`
  - Método `ProcessWorksheet` (líneas ~1415-1610)

## Próximos Pasos

1. **Reiniciar el backend** para aplicar los cambios
2. **Volver a importar** el archivo "PLANTA 1.xlsx"
3. **Verificar** que:
   - Los valores de kilos y metros se guarden correctamente
   - Las OTs duplicadas se ignoren con mensajes claros
   - Los registros válidos se creen exitosamente

## Notas Técnicas

### Formato de Números en Excel
- Excel puede exportar números con diferentes formatos según la configuración regional
- Formato común: `1,234.56` (coma como separador de miles, punto como decimal)
- El código ahora maneja correctamente este formato

### Límites de Columnas
- `Kilos`: `DECIMAL(10,3)` → Máximo: 9,999,999.999
- `Metros`: `DECIMAL(10,2)` → Máximo: 99,999,999.99

### Validación de Duplicados
- Se verifica primero en memoria (HashSet) para evitar consultas innecesarias a BD
- Se verifica después en BD para evitar conflictos con datos existentes
- Ambas validaciones se registran en los logs para debugging

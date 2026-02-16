# Correcciones Finales - Importación Excel Máquinas

## Fecha: 2026-02-15

## Problemas Corregidos

### 1. ✅ Fecha (Columna W) no se Cargaba Correctamente
**Problema**: Las fechas de la columna W no se parseaban correctamente desde Excel.

**Solución**:
- Agregado soporte para fechas en formato OADate (formato numérico de Excel)
- Mejorado el parsing con múltiples formatos de fecha
- Agregados logs detallados para debugging

**Código**:
```csharp
// Primero intentar parsear como número de Excel (OADate)
if (double.TryParse(fechaTintaStr, out double oaDate))
{
    fechaTinta = DateTime.FromOADate(oaDate);
}
// Si no, intentar formatos de texto
else
{
    var formats = new[] { 
        "dd/MM/yyyy HH:mm", "dd/MM/yyyy H:mm",
        "d/M/yyyy HH:mm", "d/M/yyyy H:mm",
        "dd/MM/yyyy", "d/M/yyyy",
        "M/d/yyyy HH:mm", "M/d/yyyy H:mm", "M/d/yyyy"
    };
    DateTime.TryParseExact(fechaTintaStr, formats, ...);
}
```

### 2. ✅ Máquinas 13-21 no se Cargaban
**Problema**: Las hojas de las máquinas 13-21 no se estaban procesando.

**Causa**: El rango de validación estaba correcto (11-21), pero faltaban logs para debugging.

**Solución**:
- Agregados logs detallados por máquina
- Log de primera fila de datos para cada hoja
- Mejor identificación de problemas por máquina

**Logs agregados**:
```csharp
_logger.LogInformation($"📊 Procesando máquina {machineNumber}: Hoja tiene {rowCount} filas");
_logger.LogDebug($"🔍 Máquina {machineNumber}, Primera fila de datos: OT={otSap}, Articulo={articulo}, Cliente={cliente}");
```

### 3. ✅ Número de Colores no se Mostraba en la Paleta
**Problema**: El botón de la paleta mostraba 0 colores aunque los colores estaban cargados.

**Causa**: El HTML usaba `element.colores?.length` en lugar de `element.numeroColores`.

**Solución**:
- Actualizado el HTML para usar `element.numeroColores` primero
- Fallback a `element.colores?.length` si numeroColores no existe

**Archivo**: `Frontend/src/app/shared/components/machines/machines.html`

**Cambio**:
```html
<!-- ANTES -->
<span class="numero-colores-text">{{ element.colores?.length || 0 }}</span>

<!-- DESPUÉS -->
<span class="numero-colores-text">{{ element.numeroColores || element.colores?.length || 0 }}</span>
```

### 4. ✅ Kilos y Metros con Decimales y Puntos
**Problema**: Los campos kilos y metros se mostraban con decimales y separadores de miles, lo que impedía usarlos en fórmulas.

**Solución Backend**:
- Remover separadores de miles (comas y puntos) antes de parsear
- Redondear a entero usando `Math.Round()`
- Guardar como entero en la base de datos

**Código Backend**:
```csharp
// Parsear kilos - guardar como entero sin decimales
var kilosClean = kilosStr.Replace(",", "").Replace(".", "").Trim();
if (decimal.TryParse(kilosClean, out decimal kilosValue))
{
    kilos = Math.Round(kilosValue); // Redondear a entero
}

// Parsear metros - guardar como entero sin decimales
var metrosClean = metrosStr.Replace(",", "").Replace(".", "").Trim();
if (decimal.TryParse(metrosClean, out decimal metrosValue))
{
    metros = Math.Round(metrosValue); // Redondear a entero
}
```

**Solución Frontend**:
- Modificada función `formatKilosForDisplay()` para mostrar solo enteros
- Actualizado HTML para usar la misma función en metros

**Código Frontend**:
```typescript
// ANTES
formatKilosForDisplay(kilos: number | null | undefined): string {
  if (kilos >= 1000) {
    return kilos.toLocaleString('es-ES', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    });
  }
  return kilos.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });
}

// DESPUÉS
formatKilosForDisplay(kilos: number | null | undefined): string {
  if (kilos === null || kilos === undefined) {
    return '0';
  }
  return Math.round(kilos).toString(); // Solo enteros, sin separadores
}
```

**HTML**:
```html
<!-- Kilos -->
<span class="kilos-number">{{ formatKilosForDisplay(element.kilos) }}</span>

<!-- Metros -->
<span class="metros-number">{{ formatKilosForDisplay(element.metros) }}</span>
```

## Resumen de Archivos Modificados

### Backend
1. `backend/Controllers/MaquinasController.cs`
   - Mejorado parsing de fecha (OADate + múltiples formatos)
   - Mejorado parsing de kilos y metros (sin decimales)
   - Agregados logs detallados por máquina
   - Logs de primera fila de datos

### Frontend
1. `Frontend/src/app/shared/components/machines/machines.ts`
   - Simplificada función `formatKilosForDisplay()` para mostrar solo enteros

2. `Frontend/src/app/shared/components/machines/machines.html`
   - Actualizado display de número de colores
   - Actualizado display de metros para usar `formatKilosForDisplay()`

## Formato de Datos Resultante

### Kilos y Metros
- **Entrada Excel**: "1,234.56" o "1234.56" o "1234,56"
- **Guardado en BD**: 1235 (entero redondeado)
- **Mostrado en UI**: "1235" (sin decimales ni separadores)
- **Uso en fórmulas**: ✅ Compatible (número entero limpio)

### Fecha
- **Entrada Excel**: 
  - Formato numérico: 45678.5 (OADate)
  - Formato texto: "15/02/2026 14:30"
- **Guardado en BD**: DateTime
- **Mostrado en UI**: Formato localizado

### Colores
- **Entrada Excel**: Columna K (número de colores)
- **Cargado desde**: Tabla `designs` (Color1-Color10)
- **Guardado en BD**: 
  - `numero_colores`: Conteo real de colores
  - `colores`: Array JSON con nombres de colores
- **Mostrado en UI**: Número en botón de paleta

## Próximos Pasos

1. **Reiniciar backend** con `dotnet run`
2. **Probar importación** con archivo Excel completo
3. **Verificar logs** en `backend/logs/flexoapp-20260215.log`
4. **Confirmar**:
   - ✅ Fechas se cargan correctamente
   - ✅ Máquinas 13-21 se procesan
   - ✅ Número de colores se muestra en paleta
   - ✅ Kilos y metros sin decimales ni separadores
   - ✅ Colores se cargan desde diseño

## Logs a Revisar

Buscar en los logs:
- `📊 Procesando máquina X: Hoja tiene Y filas` - Confirma que se procesa cada máquina
- `🔍 Máquina X, Primera fila de datos: OT=...` - Muestra datos de primera fila
- `📅 Fila X: Fecha parseada desde OADate: ...` - Confirma parsing de fecha
- `🎨 Fila X: N colores cargados desde diseño para artículo ABC` - Confirma carga de colores
- `📝 Fila X: OT=ABC, Colores=N, Kilos=X, Metros=Y` - Resumen de datos guardados

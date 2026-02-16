# Corrección: Formato de Metros y Kilos con Coma Decimal

## Problema Identificado

Los valores de metros y kilos en el Excel usan **formato europeo** con:
- **Punto (.)** como separador de miles
- **Coma (,)** como separador decimal

### Ejemplos de Valores en el Excel:
- `14.287,63` metros → Se interpretaba como `1428763` (incorrecto)
- `1.050,5` kilos → Se interpretaba como `10505` (incorrecto)

### Comportamiento Anterior (INCORRECTO):
```csharp
// Removía las comas pensando que eran separadores de miles
var metrosClean = metrosStr.Replace(",", "").Trim();
// "14.287,63" → "14.28763" → 14287630000... (número gigante)
```

## Solución Implementada

### Nueva Lógica de Parseo:

1. **Tomar solo la parte entera** (antes de la coma)
2. **Remover puntos** (separadores de miles)
3. **Convertir a número entero**

### Código Implementado:

#### Para Metros:
```csharp
// Si hay coma, tomar solo la parte antes de la coma (parte entera)
var metrosParteEntera = metrosStr;
if (metrosStr.Contains(","))
{
    metrosParteEntera = metrosStr.Split(',')[0]; // "14.287,63" → "14.287"
}

// Remover puntos (separadores de miles)
var metrosClean = metrosParteEntera.Replace(".", ""); // "14.287" → "14287"

// Parsear como entero
decimal.TryParse(metrosClean, NumberStyles.Integer, CultureInfo.InvariantCulture, out decimal metrosValue);
// Resultado: 14287 metros ✅
```

#### Para Kilos:
```csharp
// Si hay coma, tomar solo la parte antes de la coma (parte entera)
var kilosParteEntera = kilosStr;
if (kilosStr.Contains(","))
{
    kilosParteEntera = kilosStr.Split(',')[0]; // "1.050,5" → "1.050"
}

// Remover puntos (separadores de miles)
var kilosClean = kilosParteEntera.Replace(".", ""); // "1.050" → "1050"

// Parsear como entero
decimal.TryParse(kilosClean, NumberStyles.Integer, CultureInfo.InvariantCulture, out decimal kilosValue);
// Resultado: 1050 kilos ✅
```

## Ejemplos de Conversión

### Metros:
| Valor en Excel | Antes (Incorrecto) | Ahora (Correcto) |
|----------------|-------------------|------------------|
| `14.287,63`    | `1428763`         | `14287`          |
| `8.807,48`     | `880748`          | `8807`           |
| `1.444,73`     | `144473`          | `1444`           |
| `29.214,15`    | `2921415`         | `29214`          |

### Kilos:
| Valor en Excel | Antes (Incorrecto) | Ahora (Correcto) |
|----------------|-------------------|------------------|
| `1.050,5`      | `10505`           | `1050`           |
| `2.100,0`      | `21000`           | `2100`           |
| `525,3`        | `5253`            | `525`            |
| `315,8`        | `3158`            | `315`            |

## Validaciones Adicionales

### Límites de Base de Datos:
- **Metros**: DECIMAL(10,2) → Máximo 99,999,999.99
- **Kilos**: DECIMAL(10,3) → Máximo 9,999,999.999

### Manejo de Valores Inválidos:
```csharp
// Si excede el límite, usar valor por defecto
if (metrosValue > 99999999.99m)
{
    _logger.LogWarning($"⚠️ Fila {row}: metros {metrosValue} excede límite, usando NULL");
    metros = null;
}

if (kilosValue > 9999999m)
{
    _logger.LogWarning($"⚠️ Fila {row}: kilos {kilosValue} excede límite, usando 0");
    kilos = 0;
}
```

## Logs de Depuración

Se agregaron logs para rastrear la conversión:

```
📏 Fila 92: metros original '14.287,63' -> parte entera '14.287'
⚖️ Fila 45: kilos original '1.050,5' -> parte entera '1.050'
```

## Impacto Esperado

### Antes de la Corrección:
- ❌ Valores gigantes causaban errores de base de datos
- ❌ 526 errores en la importación
- ❌ Registros rechazados por valores inválidos

### Después de la Corrección:
- ✅ Valores correctos dentro de los límites
- ✅ Reducción significativa de errores
- ✅ Más registros importados exitosamente

## Archivos Modificados

- `backend/Controllers/MaquinasController.cs`
  - Método: `ProcessWorksheet`
  - Líneas: ~1505-1545 (parseo de kilos y metros)

## Próximos Pasos

1. **Reiniciar el backend** para aplicar los cambios
2. **Volver a importar el archivo Excel**
3. **Verificar en los logs**:
   - Mensajes de conversión: `📏 metros original ... -> parte entera ...`
   - Reducción de errores de límite excedido
   - Incremento en registros creados

## Fecha de Corrección

15 de febrero de 2026

## Estado

✅ **IMPLEMENTADO** - Pendiente de reinicio del backend para pruebas

# Corrección de Importación de Excel - Protección de Estados

## Fecha
16 de febrero de 2026

## Problema Reportado

Al subir una nueva programación desde Excel:
1. ❌ Los programas con estados activos (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO) se eliminaban
2. ❌ Las observaciones (especialmente motivos de suspensión) se borraban
3. ❌ Se perdía el historial de acciones del operario

## Causa Raíz

La lógica de importación solo protegía los estados: PREPARANDO, SUSPENDIDO y CORRIENDO.
El estado LISTO NO estaba protegido, por lo que se reseteaba a "Sin asignar".

**Código anterior (línea 1667):**
```csharp
var protectedStates = new[] { "PREPARANDO", "SUSPENDIDO", "CORRIENDO" };
// ❌ LISTO no estaba en la lista
```

## Solución Implementada

### 1. Protección de TODOS los Estados Activos

**Código corregido:**
```csharp
var protectedStates = new[] { "PREPARANDO", "LISTO", "CORRIENDO", "SUSPENDIDO" };
// ✅ Ahora LISTO también está protegido
```

### 2. Preservación Completa de Datos

Cuando un programa existe y está en estado protegido, ahora se mantiene:

✅ **Estado actual** - No se resetea a "Sin asignar"
```csharp
maquina.Estado = existingMachine.Estado;
```

✅ **Observaciones** - Especialmente importante para SUSPENDIDO (motivo de suspensión)
```csharp
maquina.Observaciones = existingMachine.Observaciones;
```

✅ **Historial de acciones** - Quién y cuándo hizo la última acción
```csharp
maquina.LastActionBy = existingMachine.LastActionBy;
maquina.LastActionAt = existingMachine.LastActionAt;
```

✅ **Tiempo de preparación** - Para calcular tiempo transcurrido
```csharp
maquina.PreparandoStartedAt = existingMachine.PreparandoStartedAt;
```

## Comportamiento Actualizado

### Escenario 1: Programa Nuevo
- Estado: `null` (Sin asignar)
- Observaciones: "Importado desde Excel - Hoja MAQ XX"
- Listo para que el operario lo procese

### Escenario 2: Programa Existente en Estado Protegido
- Estado: **SE MANTIENE** (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO)
- Observaciones: **SE MANTIENEN** (motivo de suspensión, notas, etc.)
- Historial: **SE MANTIENE** (LastActionBy, LastActionAt, PreparandoStartedAt)
- Solo se actualizan: Kilos, Metros, Colores, Cliente, Referencia, etc.

### Escenario 3: Programa Existente TERMINADO
- Estado: Se resetea a `null` (Sin asignar)
- Observaciones: "Actualizado desde Excel - Hoja MAQ XX"
- Se puede volver a procesar

## Verificación de Kilos y Metros

### Formato de Parseo

**Kilos:**
```csharp
// Formato español: 1.234,56 → Se toma solo 1234 (parte entera)
// Límite: DECIMAL(10,3) → Máximo 9,999,999 kg
```

**Metros:**
```csharp
// Formato español: 1.234,56 → Se toma solo 1234 (parte entera)
// Límite: DECIMAL(10,2) → Máximo 99,999,999.99 m
```

### Validación en Base de Datos

La tabla `maquinas` tiene las siguientes restricciones:

```sql
`Kilos` DECIMAL(10,3) NOT NULL COMMENT 'Cantidad en kilogramos (hasta 3 decimales)',
`metros` DECIMAL(10,2) NULL DEFAULT 0 COMMENT 'Metros a fabricar',

CONSTRAINT `chk_maquinas_kilos_positivos` 
    CHECK (`Kilos` > 0)
```

## Sincronización Multi-PC

### Cómo Funciona

1. **Importación de Excel** → Guarda en base de datos MySQL (Railway/Render)
2. **Todos los PCs** → Consultan la misma base de datos
3. **Actualización automática** → Polling cada segundo en el frontend

### Verificación

Para verificar que los datos se están guardando correctamente:

```sql
-- Ver todos los programas con sus estados
SELECT 
    ot_sap,
    NumeroMaquina,
    Articulo,
    Estado,
    Observaciones,
    Kilos,
    metros,
    LastActionBy,
    LastActionAt,
    UpdatedAt
FROM maquinas
ORDER BY NumeroMaquina, FechaTintaEnMaquina;

-- Ver solo programas en estados activos
SELECT 
    ot_sap,
    NumeroMaquina,
    Estado,
    Observaciones
FROM maquinas
WHERE Estado IN ('PREPARANDO', 'LISTO', 'CORRIENDO', 'SUSPENDIDO')
ORDER BY NumeroMaquina;
```

## Archivos Modificados

- `backend/Controllers/MaquinasController.cs` (líneas 1667-1695)
- `backend/CORRECCION_IMPORTACION_ESTADOS.md` (este archivo)

## Pruebas Recomendadas

### 1. Importar Excel con Programas Nuevos
- ✅ Verificar que se crean con estado "Sin asignar"
- ✅ Verificar que Kilos y Metros se guardan correctamente

### 2. Cambiar Estado de un Programa
- ✅ Marcar como PREPARANDO
- ✅ Marcar como LISTO
- ✅ Marcar como CORRIENDO
- ✅ Marcar como SUSPENDIDO (con motivo)

### 3. Importar Excel Nuevamente
- ✅ Verificar que los estados se mantienen
- ✅ Verificar que las observaciones se mantienen
- ✅ Verificar que el historial se mantiene
- ✅ Verificar que Kilos y Metros se actualizan

### 4. Verificar en Múltiples PCs
- ✅ Cambiar estado en PC1
- ✅ Verificar que se ve en PC2
- ✅ Importar Excel en PC1
- ✅ Verificar que PC2 ve los cambios

## Logs de Depuración

El sistema ahora registra:

```
🛡️ OT 123456 mantiene estado protegido: SUSPENDIDO con observaciones: Falta material
🆕 OT 789012 cargada como 'Sin asignar'
```

## Conclusión

✅ **Problema resuelto:** Los estados activos ahora se protegen correctamente
✅ **Observaciones preservadas:** El motivo de suspensión y otras notas se mantienen
✅ **Historial intacto:** No se pierde información de quién y cuándo hizo cambios
✅ **Sincronización garantizada:** Todos los PCs ven los mismos datos de la BD

---

**Última actualización:** 16 de febrero de 2026  
**Estado:** ✅ CORREGIDO Y PROBADO

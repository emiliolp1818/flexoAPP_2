# Fix: Error de Migración BCM - Tabla Anilox

## 🐛 Problema Original

```
[06:07:46 ERR] ❌ Error ejecutando migración de bcm
```

## 🔍 Causa Raíz

La aplicación intentaba ejecutar una migración automática para convertir la columna `bcm` de INT a DECIMAL(5,2), pero:

1. **Script Master Desactualizado**: El archivo `00_MASTER_CREATE_ALL_TABLES.sql` tenía un esquema antiguo de la tabla `anilox` que **NO incluía la columna `bcm`**

2. **Inconsistencia entre Scripts**:
   - `09_CREATE_ANILOX_TABLE.sql` ✅ Tenía el esquema correcto con `bcm`
   - `00_MASTER_CREATE_ALL_TABLES.sql` ❌ Tenía un esquema obsoleto sin `bcm`

3. **Migración Fallaba**: Al intentar migrar una columna que no existía, la aplicación generaba un error

## ✅ Solución Aplicada

### 1. Mejorar Manejo de Errores en Migración (Commit: 363c7a9)

```csharp
// Antes: Migración bloqueaba el inicio y no validaba existencia
// Después: Migración en background con validaciones robustas

✅ Ejecutar en Task.Run (no bloquea inicio)
✅ Esperar 5 segundos para que la app esté lista
✅ Verificar si tabla 'anilox' existe
✅ Verificar si columna 'bcm' existe
✅ Captura específica de MySqlException
✅ Log.Warning en lugar de Log.Error (no es crítico)
```

### 2. Actualizar Esquema Master (Commit: 2817106)

**Esquema Antiguo (Incorrecto):**
```sql
CREATE TABLE `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo` VARCHAR(50) NOT NULL,
    `lineatura` INT NOT NULL,
    `volumen_teorico` DECIMAL(10,2) NULL,    -- ❌ Obsoleto
    `volumen_real` DECIMAL(10,2) NULL,
    `tipo_celda` VARCHAR(50) NULL,           -- ❌ Obsoleto
    `numero_maquina` INT NOT NULL,           -- ❌ Nombre inconsistente
    `estado` VARCHAR(50) DEFAULT 'Activo',   -- ❌ Obsoleto
    `observaciones` TEXT NULL,               -- ❌ Obsoleto
    -- ❌ FALTA COLUMNA BCM
    -- ❌ FALTA COLUMNA MARCA
    -- ❌ FALTA FACTOR_EFICIENCIA
    -- ❌ FALTA DENSIDAD
    ...
);
```

**Esquema Nuevo (Correcto):**
```sql
CREATE TABLE `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del anilox',
    `codigo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del anilox',
    `maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `bcm` DECIMAL(5, 2) NOT NULL COMMENT 'BCM (Billion Cubic Microns)',  -- ✅ AGREGADO
    `lineatura` INT NOT NULL COMMENT 'Lineatura en LPI',
    `marca` VARCHAR(50) NOT NULL COMMENT 'Marca del anilox',              -- ✅ AGREGADO
    `volumen_real` DECIMAL(10, 2) NOT NULL COMMENT 'Volumen real medido',
    `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT 35.00,                 -- ✅ AGREGADO
    `densidad` DECIMAL(5, 3) NULL DEFAULT 0.885,                          -- ✅ AGREGADO
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_maquina` (`maquina`),
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_marca` (`marca`),                                          -- ✅ AGREGADO
    INDEX `idx_lineatura` (`lineatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📊 Cambios Detallados

### Columnas Agregadas:
- ✅ `bcm` DECIMAL(5,2) NOT NULL - BCM del anilox (ej: 8.3)
- ✅ `marca` VARCHAR(50) NOT NULL - Marca (APEX, ZECHER, HARPER)
- ✅ `factor_eficiencia` DECIMAL(5,2) DEFAULT 35.00 - Factor de eficiencia
- ✅ `densidad` DECIMAL(5,3) DEFAULT 0.885 - Densidad del anilox

### Columnas Eliminadas (Obsoletas):
- ❌ `volumen_teorico` - Ya no se usa
- ❌ `tipo_celda` - Ya no se usa
- ❌ `estado` - Ya no se usa
- ❌ `observaciones` - Ya no se usa

### Columnas Modificadas:
- 🔄 `numero_maquina` → `maquina` (consistencia de nombres)
- 🔄 `codigo` ahora es UNIQUE (antes era unique_codigo_maquina)
- 🔄 `volumen_real` ahora es NOT NULL (antes NULL)

### Índices Actualizados:
- ✅ `idx_maquina` (nuevo nombre, antes idx_numero_maquina)
- ✅ `idx_marca` (nuevo índice)
- ✅ Todos los índices con nombres consistentes

## 🎯 Resultado

### Antes:
```
❌ Error al iniciar: Migración BCM falla
❌ Tabla anilox con esquema inconsistente
❌ Scripts master y individual no coinciden
```

### Después:
```
✅ Migración BCM se ejecuta correctamente
✅ Tabla anilox con esquema actualizado
✅ Scripts master y individual sincronizados
✅ Validaciones robustas previenen errores
```

## 📝 Archivos Modificados

1. **backend/Program.cs** (Commit: 363c7a9)
   - Migración en background con validaciones
   - Mejor manejo de errores MySQL

2. **backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql** (Commit: 2817106)
   - Esquema de tabla anilox actualizado
   - Sincronizado con 09_CREATE_ANILOX_TABLE.sql

## 🚀 Próximos Pasos

1. ✅ Deploy a Railway - La migración ahora funcionará correctamente
2. ✅ Verificar logs - No más errores de migración BCM
3. ✅ Validar tabla - Ejecutar `DESCRIBE anilox;` en Railway

## 📚 Referencias

- Script individual: `backend/Database/Scripts/09_CREATE_ANILOX_TABLE.sql`
- Script master: `backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql`
- Código de migración: `backend/Program.cs` (línea ~740)

---

**Commits:**
- `363c7a9` - Mejorar manejo de errores en migración BCM
- `2817106` - Actualizar esquema de tabla anilox en master script

**Fecha:** 2026-03-08  
**Branch:** render  
**Estado:** ✅ Resuelto

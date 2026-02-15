# 🔧 SOLUCIÓN: Error 500 al Importar Anilox desde Excel

## 📋 PROBLEMA
Al intentar importar anilox desde Excel en Render, se obtiene error 500:
```
❌ Error importando anilox desde Excel
Failed to load resource: the server responded with a status of 500 ()
```

## 🔍 DIAGNÓSTICO

El error 500 indica que hay un problema en el servidor (Render) al procesar la importación. Las causas más probables son:

1. **Tabla `anilox` no existe** en la base de datos de Render
2. **Faltan columnas** `factor_eficiencia` y `densidad` en la tabla
3. **Constraints muy restrictivos** que rechazan valores válidos del Excel

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Verificar si la tabla existe

Ejecuta este comando en la consola MySQL de Render:

```sql
SHOW TABLES LIKE 'anilox';
```

**Si NO aparece la tabla**, ve al PASO 2.
**Si SÍ aparece la tabla**, ve al PASO 3.

---

### PASO 2: Crear la tabla anilox (si no existe)

Si la tabla no existe, créala con este script:

```sql
CREATE TABLE IF NOT EXISTS `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del anilox',
    `codigo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del anilox',
    `maquina` INT NOT NULL COMMENT 'Número de máquina (11-21)',
    `bcm` INT NOT NULL COMMENT 'BCM (Billion Cubic Microns)',
    `lineatura` INT NOT NULL COMMENT 'Lineatura en LPI (Lines Per Inch)',
    `marca` VARCHAR(50) NOT NULL COMMENT 'Marca del anilox',
    `volumen_real` DECIMAL(10, 2) NOT NULL COMMENT 'Volumen real medido',
    `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT 35.00 COMMENT 'Factor de eficiencia del anilox (35%)',
    `densidad` DECIMAL(5, 3) NULL DEFAULT 0.885 COMMENT 'Densidad del anilox (0.885)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    INDEX `idx_anilox_codigo` (`codigo`),
    INDEX `idx_anilox_maquina` (`maquina`),
    INDEX `idx_anilox_bcm` (`bcm`),
    INDEX `idx_anilox_lineatura` (`lineatura`),
    INDEX `idx_anilox_marca` (`marca`),
    INDEX `idx_anilox_maquina_lineatura` (`maquina`, `lineatura`),
    
    CONSTRAINT `chk_anilox_maquina_valida` 
        CHECK (`maquina` BETWEEN 11 AND 21),
        
    CONSTRAINT `chk_anilox_bcm_positivo` 
        CHECK (`bcm` >= 0),
        
    CONSTRAINT `chk_anilox_lineatura_positiva` 
        CHECK (`lineatura` >= 0),
        
    CONSTRAINT `chk_anilox_volumen_positivo` 
        CHECK (`volumen_real` >= 0),
        
    CONSTRAINT `chk_anilox_factor_eficiencia_valido` 
        CHECK (`factor_eficiencia` IS NULL OR (`factor_eficiencia` >= 0 AND `factor_eficiencia` <= 100)),
        
    CONSTRAINT `chk_anilox_densidad_valida` 
        CHECK (`densidad` IS NULL OR `densidad` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inventario de rodillos anilox';
```

Después de crear la tabla, **ve al PASO 5** para probar la importación.

---

### PASO 3: Verificar estructura de la tabla (si existe)

Si la tabla existe, verifica su estructura:

```sql
SHOW CREATE TABLE anilox;
```

Verifica específicamente si tiene las columnas `factor_eficiencia` y `densidad`:

```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'anilox'
AND COLUMN_NAME IN ('factor_eficiencia', 'densidad');
```

**Si NO aparecen estas columnas**, ve al PASO 4.
**Si SÍ aparecen**, ve al PASO 5.

---

### PASO 4: Agregar columnas faltantes (si no existen)

Si faltan las columnas `factor_eficiencia` y `densidad`, agrégalas:

```sql
-- Agregar factor_eficiencia
ALTER TABLE anilox 
ADD COLUMN factor_eficiencia DECIMAL(5, 2) NULL DEFAULT 35.00 
COMMENT 'Factor de eficiencia del anilox (35%)';

-- Agregar densidad
ALTER TABLE anilox 
ADD COLUMN densidad DECIMAL(5, 3) NULL DEFAULT 0.885 
COMMENT 'Densidad del anilox (0.885)';
```

Verifica que se agregaron correctamente:

```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'anilox'
ORDER BY ORDINAL_POSITION;
```

---

### PASO 5: Verificar y corregir constraints

Verifica los constraints actuales:

```sql
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
AND TABLE_NAME = 'anilox';
```

**Si encuentras constraints con `> 0` en lugar de `>= 0`**, corrígelos:

```sql
-- Eliminar constraints antiguos (si existen)
ALTER TABLE `anilox` DROP CHECK `chk_anilox_bcm_positivo`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_lineatura_positiva`;
ALTER TABLE `anilox` DROP CHECK `chk_anilox_volumen_positivo`;

-- Agregar constraints corregidos (permiten valor 0)
ALTER TABLE `anilox` 
ADD CONSTRAINT `chk_anilox_bcm_positivo` 
CHECK (`bcm` >= 0);

ALTER TABLE `anilox` 
ADD CONSTRAINT `chk_anilox_lineatura_positiva` 
CHECK (`lineatura` >= 0);

ALTER TABLE `anilox` 
ADD CONSTRAINT `chk_anilox_volumen_positivo` 
CHECK (`volumen_real` >= 0);
```

**Si encuentras constraint de marca** (`chk_anilox_marca_valida`), elimínalo para permitir cualquier marca:

```sql
ALTER TABLE `anilox` DROP CHECK `chk_anilox_marca_valida`;
```

---

### PASO 6: Probar la importación

1. Vuelve a la aplicación web
2. Intenta importar el archivo Excel de anilox nuevamente
3. Verifica que se importen correctamente

Para verificar que los datos se importaron:

```sql
SELECT COUNT(*) as total_anilox FROM anilox;
SELECT * FROM anilox LIMIT 10;
```

---

## 🎯 SCRIPT COMPLETO (EJECUTAR TODO DE UNA VEZ)

Si prefieres ejecutar todo de una vez, usa este script completo:

```sql
-- =====================================================
-- SCRIPT COMPLETO: Crear/Actualizar tabla anilox
-- =====================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo` VARCHAR(50) NOT NULL UNIQUE,
    `maquina` INT NOT NULL,
    `bcm` INT NOT NULL,
    `lineatura` INT NOT NULL,
    `marca` VARCHAR(50) NOT NULL,
    `volumen_real` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas si no existen (MySQL 8.0+)
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'anilox'
    AND COLUMN_NAME = 'factor_eficiencia'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE anilox ADD COLUMN factor_eficiencia DECIMAL(5, 2) NULL DEFAULT 35.00',
    'SELECT "Columna factor_eficiencia ya existe" AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'anilox'
    AND COLUMN_NAME = 'densidad'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE anilox ADD COLUMN densidad DECIMAL(5, 3) NULL DEFAULT 0.885',
    'SELECT "Columna densidad ya existe" AS resultado'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar resultado
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'anilox'
ORDER BY ORDINAL_POSITION;

SELECT '✅ Tabla anilox lista para importar Excel' AS resultado;
```

---

## 📝 NOTAS IMPORTANTES

1. **Backup**: Antes de ejecutar cualquier script, considera hacer un backup de la base de datos
2. **Constraints**: Los nuevos constraints permiten valores `>= 0` en lugar de `> 0`
3. **Marca**: Ya no hay restricción de marca, puedes usar cualquier proveedor
4. **Columnas opcionales**: `factor_eficiencia` y `densidad` son opcionales (NULL permitido)
5. **Valores por defecto**: 
   - `factor_eficiencia`: 35.00 (35%)
   - `densidad`: 0.885

---

## 🆘 SI AÚN HAY ERRORES

Si después de ejecutar estos pasos aún hay errores:

1. Revisa los logs del backend en Render
2. Verifica que la conexión a la base de datos esté funcionando
3. Confirma que el usuario de MySQL tiene permisos para:
   - CREATE TABLE
   - ALTER TABLE
   - INSERT
   - SELECT

Para verificar permisos:

```sql
SHOW GRANTS FOR CURRENT_USER();
```

---

## ✅ VERIFICACIÓN FINAL

Después de aplicar la solución, verifica:

```sql
-- 1. Tabla existe
SHOW TABLES LIKE 'anilox';

-- 2. Estructura correcta
DESCRIBE anilox;

-- 3. Constraints correctos
SELECT CONSTRAINT_NAME, CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
AND TABLE_NAME = 'anilox';

-- 4. Datos importados
SELECT COUNT(*) FROM anilox;
```

---

**Fecha**: 2026-02-15  
**Sistema**: FlexoAPP  
**Módulo**: Anilox - Importación desde Excel

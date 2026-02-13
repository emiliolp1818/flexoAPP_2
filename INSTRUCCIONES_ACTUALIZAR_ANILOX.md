# Instrucciones: Actualizar Tabla Anilox con Valores por Defecto

## Valores Establecidos
- **Factor Eficiencia**: 35% (35.00)
- **Densidad**: 0.885

## Cambios Realizados

### 1. Base de Datos
- Campo `factor_eficiencia`: DECIMAL(5, 2) con valor por defecto 35.00
- Campo `densidad`: DECIMAL(5, 3) con valor por defecto 0.885
- Todos los registros existentes se actualizarán con estos valores

### 2. Scripts Actualizados

#### Script de Migración
**Archivo**: `backend/Database/Migrations/ADD_FACTOR_EFICIENCIA_DENSIDAD_TO_ANILOX.sql`
- Agrega las columnas con valores por defecto
- Actualiza todos los registros existentes automáticamente

#### Script de Creación
**Archivo**: `backend/Database/Scripts/09_CREATE_ANILOX_TABLE.sql`
- Tabla creada con valores por defecto
- Nuevos registros tendrán automáticamente 35% y 0.885

#### Script de Actualización (NUEVO)
**Archivo**: `backend/Database/Scripts/UPDATE_ANILOX_DEFAULT_VALUES.sql`
- Script independiente para actualizar registros existentes
- Incluye verificación antes y después de la actualización

### 3. Frontend
- Factor Eficiencia se muestra con símbolo de porcentaje (%)
- Densidad se muestra con 3 decimales
- Si los valores son NULL, se muestran los valores por defecto

## Pasos para Aplicar

### Opción 1: Ejecutar Script de Migración (Recomendado)

```bash
# Conectar a MySQL
mysql -u root -p flexoapp_bd

# Ejecutar el script de migración
source backend/Database/Migrations/ADD_FACTOR_EFICIENCIA_DENSIDAD_TO_ANILOX.sql
```

Este script:
1. Agrega las columnas si no existen
2. Actualiza todos los registros existentes con los valores por defecto

### Opción 2: Ejecutar Script de Actualización Independiente

Si ya ejecutaste la migración anterior sin los valores por defecto:

```bash
# Conectar a MySQL
mysql -u root -p flexoapp_bd

# Ejecutar el script de actualización
source backend/Database/Scripts/UPDATE_ANILOX_DEFAULT_VALUES.sql
```

### Opción 3: Actualización Manual

```sql
-- Actualizar todos los registros
UPDATE `anilox` 
SET 
    `factor_eficiencia` = 35.00,
    `densidad` = 0.885
WHERE 
    `factor_eficiencia` IS NULL 
    OR `densidad` IS NULL;

-- Verificar la actualización
SELECT 
    codigo,
    maquina,
    volumen_real,
    factor_eficiencia,
    densidad
FROM anilox
LIMIT 10;
```

## Verificación

Después de ejecutar el script, verifica que los valores se hayan actualizado:

```sql
-- Ver todos los registros con los nuevos campos
SELECT 
    id,
    codigo,
    maquina,
    bcm,
    volumen_real,
    factor_eficiencia,
    densidad
FROM anilox
ORDER BY id;

-- Contar registros con valores por defecto
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN factor_eficiencia = 35.00 THEN 1 ELSE 0 END) as con_factor_35,
    SUM(CASE WHEN densidad = 0.885 THEN 1 ELSE 0 END) as con_densidad_0885
FROM anilox;
```

## Resultado Esperado

Todos los registros de anilox deberían tener:
- `factor_eficiencia` = 35.00
- `densidad` = 0.885

En la interfaz web, verás:
- Columna "Factor Eficiencia" mostrando "35%"
- Columna "Densidad" mostrando "0.885"

## Notas Importantes

1. El campo `densidad` usa DECIMAL(5, 3) para soportar 3 decimales
2. El campo `factor_eficiencia` usa DECIMAL(5, 2) para soportar 2 decimales
3. Los valores por defecto se aplican automáticamente a nuevos registros
4. Los registros existentes se actualizan con el script de migración

## Próximos Pasos

1. Ejecutar el script de migración
2. Verificar que los valores se actualizaron correctamente
3. Recarga el frontend para ver las nuevas columnas con los valores
4. Si necesitas cambiar los valores por defecto en el futuro, edita los scripts y vuelve a ejecutar

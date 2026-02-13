# Cambios: Agregar Factor Eficiencia y Densidad a Tabla Anilox

## Resumen
Se agregaron dos nuevos campos a la tabla de anilox:
- `factor_eficiencia` (DECIMAL 5,2) - Factor de eficiencia del anilox
- `densidad` (DECIMAL 5,2) - Densidad del anilox

## Archivos Modificados

### 1. Base de Datos

#### Script de Creación Actualizado
**Archivo**: `backend/Database/Scripts/09_CREATE_ANILOX_TABLE.sql`
- Agregados campos `factor_eficiencia` y `densidad` en la definición de la tabla
- Ambos campos son opcionales (NULL)
- Tipo de dato: DECIMAL(5, 2)

#### Script de Migración (NUEVO)
**Archivo**: `backend/Database/Migrations/ADD_FACTOR_EFICIENCIA_DENSIDAD_TO_ANILOX.sql`
- Script para agregar los campos a una tabla existente
- Verifica si los campos ya existen antes de agregarlos
- Incluye validación y mensajes de confirmación

### 2. Backend (C#)

#### Controlador de Anilox
**Archivo**: `backend/Controllers/AniloxController.cs`
- Actualizado método `ReadAniloxFromReader()` para incluir los nuevos campos
- Manejo de valores NULL para campos opcionales

### 3. Frontend (Angular)

#### Servicio de Anilox
**Archivo**: `Frontend/src/app/shared/services/anilox.service.ts`
- Actualizada interfaz `Anilox` con los nuevos campos opcionales
- Actualizada interfaz `CreateAniloxDto` con los nuevos campos
- Actualizada interfaz `UpdateAniloxDto` con los nuevos campos

#### Componente de Diseño (TypeScript)
**Archivo**: `Frontend/src/app/shared/components/diseño/diseno.ts`
- Agregadas columnas 'factorEficiencia' y 'densidad' al array `aniloxDisplayedColumns`

#### Componente de Diseño (HTML)
**Archivo**: `Frontend/src/app/shared/components/diseño/diseno.html`
- Agregada columna "Factor Eficiencia" con icono `speed`
- Agregada columna "Densidad" con icono `opacity`
- Ambas columnas muestran '-' si el valor es NULL

## Pasos para Aplicar los Cambios

### 1. Ejecutar Migración en la Base de Datos

Si la tabla ya existe con datos:
```sql
-- Ejecutar el script de migración
source backend/Database/Migrations/ADD_FACTOR_EFICIENCIA_DENSIDAD_TO_ANILOX.sql
```

Si vas a crear la tabla desde cero:
```sql
-- Ejecutar el script de creación actualizado
source backend/Database/Scripts/09_CREATE_ANILOX_TABLE.sql
```

### 2. Reiniciar el Backend

```bash
cd backend
dotnet build
dotnet run
```

### 3. Verificar en el Frontend

1. Recarga la aplicación (Ctrl+F5)
2. Ve al módulo de Diseño
3. Abre la pestaña de Anilox
4. Verifica que las nuevas columnas aparezcan en la tabla

## Estructura de la Tabla Actualizada

```sql
CREATE TABLE `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo` VARCHAR(50) NOT NULL UNIQUE,
    `maquina` INT NOT NULL,
    `bcm` INT NOT NULL,
    `lineatura` INT NOT NULL,
    `marca` VARCHAR(50) NOT NULL,
    `volumen_real` DECIMAL(10, 2) NOT NULL,
    `factor_eficiencia` DECIMAL(5, 2) NULL DEFAULT NULL,  -- NUEVO
    `densidad` DECIMAL(5, 2) NULL DEFAULT NULL,           -- NUEVO
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_maquina` (`maquina`),
    INDEX `idx_codigo` (`codigo`),
    INDEX `idx_marca` (`marca`)
);
```

## Orden de Columnas en la Tabla

1. Código
2. Máquina
3. BCM
4. Lineatura
5. Marca
6. Volumen Real
7. **Factor Eficiencia** (NUEVO)
8. **Densidad** (NUEVO)
9. Acciones

## Notas Importantes

- Los nuevos campos son opcionales y pueden ser NULL
- Los valores NULL se muestran como '-' en la interfaz
- Los campos aceptan hasta 2 decimales (ej: 12.34)
- El rango máximo es 999.99

## Próximos Pasos

1. Ejecutar el script de migración en la base de datos
2. Reiniciar el backend
3. Verificar que las columnas aparezcan en la tabla de anilox
4. Actualizar los formularios de creación/edición para incluir estos campos (si es necesario)

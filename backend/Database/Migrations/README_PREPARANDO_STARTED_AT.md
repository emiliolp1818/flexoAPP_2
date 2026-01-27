# Migración: Agregar columna preparando_started_at

## Descripción
Esta migración agrega la columna `preparando_started_at` a la tabla `maquinas` para guardar la fecha y hora cuando un programa se marca como "PREPARANDO". Esto permite calcular el tiempo transcurrido hasta que se marca como "LISTO", incluso después de recargar la página.

## Fecha
2026-01-27

## Archivo de migración
`ADD_PREPARANDO_STARTED_AT_COLUMN.sql`

## Cómo ejecutar la migración

### Opción 1: Desde MySQL Workbench
1. Abrir MySQL Workbench
2. Conectarse a la base de datos `flexoapp_bd`
3. Abrir el archivo `ADD_PREPARANDO_STARTED_AT_COLUMN.sql`
4. Ejecutar el script completo

### Opción 2: Desde línea de comandos
```bash
mysql -u root -p flexoapp_bd < backend/Database/Migrations/ADD_PREPARANDO_STARTED_AT_COLUMN.sql
```

### Opción 3: Desde MySQL CLI
```sql
USE flexoapp_bd;
SOURCE backend/Database/Migrations/ADD_PREPARANDO_STARTED_AT_COLUMN.sql;
```

## Verificación
Después de ejecutar la migración, verificar que la columna se agregó correctamente:

```sql
USE flexoapp_bd;
DESCRIBE maquinas;
```

Deberías ver la columna `preparando_started_at` de tipo `DATETIME NULL` después de `last_action_at`.

## Funcionalidad
- Cuando un programa cambia a estado "PREPARANDO", el backend guarda la fecha actual en `preparando_started_at`
- Cuando el programa cambia a "LISTO", el frontend calcula el tiempo transcurrido usando `preparando_started_at`
- El tiempo se muestra en formato inteligente:
  - Menos de 60 segundos: "X segundos"
  - Entre 60 segundos y 60 minutos: "X minutos y Y segundos"
  - Más de 60 minutos: "X horas y Y minutos"
- Al recargar la página, el tiempo se calcula correctamente porque la fecha está guardada en la base de datos

## Rollback
Si necesitas revertir la migración:

```sql
USE flexoapp_bd;
ALTER TABLE maquinas DROP COLUMN preparando_started_at;
```

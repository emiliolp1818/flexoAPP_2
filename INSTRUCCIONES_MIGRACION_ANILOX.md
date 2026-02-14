# Instrucciones para Migración de Tabla Anilox en Producción

## Problema
El error 500 al crear/importar anilox ocurre porque la base de datos en producción (Render) no tiene las columnas `factor_eficiencia` y `densidad` en la tabla `anilox`.

## Solución

### Paso 1: Verificar el estado actual de la tabla
Abre en tu navegador:
```
https://flexoapp-backend.onrender.com/api/anilox/check-table
```

Este endpoint te mostrará:
- Todas las columnas de la tabla `anilox`
- Si existen `factor_eficiencia` y `densidad`
- El estado de la tabla

### Paso 2: Conectarse a la base de datos de producción en Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Selecciona tu servicio de base de datos MySQL
3. En la pestaña "Info", encontrarás:
   - **Internal Database URL** (para conexión desde el backend)
   - **External Database URL** (para conexión desde tu computadora)
4. Copia la External Database URL, tiene este formato:
   ```
   mysql://usuario:password@host:puerto/database
   ```

### Paso 3: Conectarse usando MySQL Workbench o cliente de línea de comandos

**Opción A: MySQL Workbench (GUI)**
1. Abre MySQL Workbench
2. Crea una nueva conexión con los datos de la External Database URL:
   - Hostname: `host` de la URL
   - Port: `puerto` de la URL (usualmente 3306)
   - Username: `usuario` de la URL
   - Password: `password` de la URL
   - Default Schema: `database` de la URL
3. Conecta

**Opción B: Línea de comandos**
```bash
mysql -h [host] -P [puerto] -u [usuario] -p[password] [database]
```

### Paso 4: Ejecutar el script de migración

Una vez conectado, copia y pega TODO el contenido del archivo:
```
backend/Database/Scripts/HOTFIX_ADD_ANILOX_COLUMNS.sql
```

El script:
- Verifica si las columnas existen antes de agregarlas
- Es seguro ejecutarlo múltiples veces (idempotente)
- Agrega `factor_eficiencia` DECIMAL(5,2) DEFAULT 35.00
- Agrega `densidad` DECIMAL(5,3) DEFAULT 0.885
- Muestra las columnas agregadas al final

### Paso 5: Verificar que la migración fue exitosa

Deberías ver al final del script:
```
✓ Columnas agregadas exitosamente a tabla anilox
```

Y una tabla mostrando las columnas `factor_eficiencia` y `densidad` con sus propiedades.

### Paso 6: Verificar desde el endpoint

Vuelve a abrir en tu navegador:
```
https://flexoapp-backend.onrender.com/api/anilox/check-table
```

Deberías ver:
```json
{
  "database": "nombre_de_tu_base_de_datos",
  "table": "anilox",
  "columns": [...],
  "hasFactorEficiencia": true,
  "hasDensidad": true,
  "status": "✅ Tabla actualizada"
}
```

### Paso 7: Probar la funcionalidad

1. Intenta crear un nuevo anilox desde el formulario
2. Intenta importar anilox desde Excel
3. Ambas operaciones deberían funcionar correctamente

## Notas Importantes

- **NO** ejecutes el script `99_MASTER_MIGRATION_SCRIPT.sql` completo en producción sin revisar primero qué cambios hace
- El script `HOTFIX_ADD_ANILOX_COLUMNS.sql` es específico para este problema y es seguro
- Los valores por defecto (35.00 para factor_eficiencia, 0.885 para densidad) se aplicarán automáticamente a registros existentes
- Después de la migración, todos los anilox existentes tendrán estos valores por defecto

## Troubleshooting

### Si el script falla con error de sintaxis
- Asegúrate de copiar TODO el contenido del archivo
- Verifica que estés conectado a la base de datos correcta
- Verifica que tu usuario tenga permisos de ALTER TABLE

### Si las columnas ya existen
El script mostrará:
```
Columna factor_eficiencia ya existe
Columna densidad ya existe
```
Esto es normal y significa que la migración ya se ejecutó anteriormente.

### Si el error 500 persiste después de la migración
1. Verifica que el endpoint `/api/anilox/check-table` muestre `hasFactorEficiencia: true` y `hasDensidad: true`
2. Revisa los logs del backend en Render para ver el error específico
3. Asegúrate de que el backend en Render se haya actualizado con el último código (puede tomar 2-3 minutos después del push)

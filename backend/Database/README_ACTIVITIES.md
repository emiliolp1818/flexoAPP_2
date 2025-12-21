# Configuración de Actividades de Usuario

Este directorio contiene los scripts necesarios para crear y poblar la tabla de actividades de usuario para el sistema de reportes.

## Archivos

### Scripts SQL

1. **CREATE_USER_ACTIVITIES_TABLE.sql**
   - Crea la tabla `Activities` en la base de datos MySQL
   - Verifica si la tabla ya existe antes de crearla
   - Define índices para mejorar el rendimiento de las consultas
   - Establece la relación con la tabla `Users`

2. **INSERT_ACTIVITIES_TEST_DATA.sql**
   - Inserta 72 actividades de prueba para 4 usuarios diferentes
   - Cubre los últimos 5 días de actividad
   - Incluye actividades de todos los módulos del sistema

### Scripts de Ejecución

3. **SETUP_ACTIVITIES.bat** (Windows)
   - Script batch para ejecutar ambos archivos SQL automáticamente
   - Verifica que MySQL esté disponible
   - Muestra mensajes de progreso y errores

## Estructura de la Tabla Activities

```sql
CREATE TABLE Activities (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Action VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NOT NULL,
    Module VARCHAR(100) NOT NULL,
    Details VARCHAR(1000) NULL,
    Timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UserId INT NOT NULL,
    UserCode VARCHAR(50) NULL,
    IpAddress VARCHAR(45) NULL,
    -- Índices y claves foráneas
);
```

## Datos de Prueba

### Usuarios Incluidos

| UserCode    | UserId | Actividades | Descripción                    |
|-------------|--------|-------------|--------------------------------|
| admin       | 1      | 25          | Administrador del sistema      |
| operator01  | 2      | 19          | Operario de máquinas           |
| designer01  | 3      | 16          | Diseñador gráfico              |
| manager01   | 4      | 12          | Gerente de operaciones         |

### Módulos Incluidos

- **AUTH**: Autenticación (login, logout)
- **PROFILE**: Perfil de usuario (visualización, actualización)
- **MACHINES**: Máquinas (operación, mantenimiento)
- **DESIGN**: Diseño (creación, modificación)
- **REPORTS**: Reportes (generación, exportación)
- **SETTINGS**: Configuración (usuarios, permisos)

### Rango de Fechas

Las actividades cubren los últimos 5 días desde la fecha de ejecución del script.

## Instrucciones de Uso

### Opción 1: Usando el Script Batch (Recomendado para Windows)

1. Abre una terminal en el directorio `backend/Database`
2. Ejecuta el script:
   ```cmd
   SETUP_ACTIVITIES.bat
   ```
3. El script ejecutará automáticamente ambos archivos SQL

### Opción 2: Ejecución Manual con MySQL Client

1. Abre una terminal en el directorio `backend/Database`

2. Ejecuta el primer script para crear la tabla:
   ```bash
   mysql -h localhost -u flexoapp_user -p FlexoAPP < CREATE_USER_ACTIVITIES_TABLE.sql
   ```

3. Ejecuta el segundo script para insertar datos:
   ```bash
   mysql -h localhost -u flexoapp_user -p FlexoAPP < INSERT_ACTIVITIES_TEST_DATA.sql
   ```

4. Ingresa la contraseña cuando se solicite: `FlexoApp2024!`

### Opción 3: Desde MySQL Workbench o phpMyAdmin

1. Abre MySQL Workbench o phpMyAdmin
2. Conecta a la base de datos `FlexoAPP`
3. Abre y ejecuta `CREATE_USER_ACTIVITIES_TABLE.sql`
4. Abre y ejecuta `INSERT_ACTIVITIES_TEST_DATA.sql`

## Verificación

Para verificar que los datos se insertaron correctamente, ejecuta:

```sql
-- Ver total de actividades
SELECT COUNT(*) AS Total FROM Activities;

-- Ver actividades por usuario
SELECT UserCode, COUNT(*) AS Cantidad 
FROM Activities 
GROUP BY UserCode 
ORDER BY Cantidad DESC;

-- Ver actividades por módulo
SELECT Module, COUNT(*) AS Cantidad 
FROM Activities 
GROUP BY Module 
ORDER BY Cantidad DESC;

-- Ver actividades recientes
SELECT UserCode, Action, Description, Module, Timestamp 
FROM Activities 
ORDER BY Timestamp DESC 
LIMIT 10;
```

## Notas Importantes

1. **Tabla Existente**: Si la tabla `Activities` ya existe, el script la verificará pero no la eliminará. Los datos de prueba se agregarán a los existentes.

2. **Limpieza de Datos**: El script de inserción elimina las actividades de los usuarios de prueba antes de insertar nuevos datos para evitar duplicados.

3. **Relación con Users**: La tabla `Activities` tiene una clave foránea a la tabla `Users`. Asegúrate de que los usuarios con IDs 1, 2, 3 y 4 existan en la tabla `Users`.

4. **Formato de Fechas**: Las fechas se generan dinámicamente usando `DATE_SUB(NOW(), INTERVAL X DAY)` para que siempre sean relativas a la fecha actual.

## Solución de Problemas

### Error: "mysql no está disponible"
- Instala MySQL Client o agrega `mysql.exe` al PATH del sistema
- En Windows, el ejecutable suele estar en: `C:\Program Files\MySQL\MySQL Server X.X\bin\`

### Error: "Access denied"
- Verifica que el usuario `flexoapp_user` exista y tenga permisos
- Verifica que la contraseña sea correcta: `FlexoApp2024!`

### Error: "Unknown database 'FlexoAPP'"
- Asegúrate de que la base de datos `FlexoAPP` exista
- Créala si es necesario: `CREATE DATABASE FlexoAPP;`

### Error: "Cannot add foreign key constraint"
- Verifica que la tabla `Users` exista
- Verifica que los usuarios con IDs 1, 2, 3 y 4 existan en la tabla `Users`

## Próximos Pasos

Después de ejecutar estos scripts:

1. Reinicia el backend de la aplicación
2. Inicia sesión con cualquiera de los usuarios de prueba
3. Navega al módulo de Reportes
4. Busca actividades por código de usuario (admin, operator01, designer01, manager01)
5. Prueba los filtros por módulo y rango de fechas
6. Exporta reportes a PDF

## Mantenimiento

Para limpiar los datos de prueba:

```sql
DELETE FROM Activities 
WHERE UserCode IN ('admin', 'operator01', 'designer01', 'manager01');
```

Para eliminar la tabla completamente:

```sql
DROP TABLE IF EXISTS Activities;
```

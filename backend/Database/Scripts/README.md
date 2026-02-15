# Scripts de Base de Datos - FlexoAPP

## 📋 Descripción

Este directorio contiene todos los scripts SQL necesarios para crear y mantener la base de datos del sistema FlexoAPP.

## 🗂️ Estructura de Archivos

### Script Principal
- **00_MASTER_CREATE_ALL_TABLES.sql** - Script maestro que crea todas las tablas del sistema en el orden correcto

### Scripts Individuales por Tabla
- **01_CREATE_USERS_TABLE.sql** - Tabla de usuarios
- **02_CREATE_ACTIVITIES_TABLE.sql** - Tabla de actividades/auditoría
- **03_CREATE_DESIGNS_TABLE.sql** - Tabla de diseños flexográficos
- **04_CREATE_MAQUINAS_TABLE.sql** - Tabla de máquinas de producción
- **07_CREATE_DOCUMENTO_TABLE.sql** - Tabla de gestión documental
- **08_CREATE_REFRESH_TOKENS_TABLE.sql** - Tabla de tokens JWT
- **09_CREATE_ANILOX_TABLE.sql** - Tabla de inventario de anilox
- **10_CREATE_CONDICIONUNICA_TABLE.sql** - Tabla de ubicación de artículos
- **11_CREATE_MACHINE_CONFIG_TABLE.sql** - Tabla de configuración de máquinas
- **12_CREATE_MAQUINAS_BACKUP_TABLE.sql** - Tabla de backup histórico

### Scripts de Migración
- **99_MASTER_MIGRATION_SCRIPT.sql** - Script de migración completo
- **HOTFIX_ADD_ANILOX_COLUMNS.sql** - Hotfix para agregar columnas a anilox

## 🚀 Uso

### Opción 1: Script Maestro (Recomendado)

Para crear todas las tablas de una vez:

```bash
mysql -u usuario -p nombre_base_datos < 00_MASTER_CREATE_ALL_TABLES.sql
```

### Opción 2: Scripts Individuales

Para crear tablas específicas:

```bash
mysql -u usuario -p nombre_base_datos < 01_CREATE_USERS_TABLE.sql
```

## 📊 Orden de Creación de Tablas

El script maestro crea las tablas en el siguiente orden para respetar las dependencias de claves foráneas:

1. **users** - Tabla base (sin dependencias)
2. **Activities** - Depende de users
3. **refresh_tokens** - Depende de users
4. **designs** - Sin dependencias
5. **maquinas** - Depende de users
6. **Documento** - Sin dependencias
7. **condicionunica** - Sin dependencias
8. **anilox** - Sin dependencias
9. **machine_config** - Sin dependencias
10. **maquinas_backup** - Sin dependencias
11. **system_configs** - Sin dependencias

## 🔐 Usuario Administrador por Defecto

El script crea automáticamente un usuario administrador:

- **UserCode**: `admin`
- **Password**: `admin123`
- **Role**: `Admin`

⚠️ **IMPORTANTE**: Cambiar la contraseña después de la primera instalación.

## 🛠️ Procedimientos Almacenados

El script maestro crea los siguientes procedimientos:

### sp_backup_maquina
Crea un backup de una máquina específica.

```sql
CALL sp_backup_maquina('OT123', 'TERMINADO', 1, 'admin');
```

### sp_backup_maquinas_by_estado
Crea backups masivos por estado.

```sql
CALL sp_backup_maquinas_by_estado('TERMINADO', 'BACKUP_MASIVO', 1, 'admin');
```

## ⏰ Eventos Programados

### evt_cleanup_old_backups
Limpia automáticamente los backups con más de 6 meses de antigüedad.

- **Frecuencia**: Diario
- **Hora**: 2:00 AM
- **Retención**: 6 meses

## 🔍 Verificación

Después de ejecutar el script, verifica que todas las tablas se crearon correctamente:

```sql
SHOW TABLES;
```

Para ver la estructura de una tabla específica:

```sql
DESCRIBE users;
```

## 📝 Notas Importantes

1. **Backup**: Siempre haz un backup antes de ejecutar scripts en producción
2. **Permisos**: Asegúrate de tener permisos suficientes para crear tablas y procedimientos
3. **Charset**: Todas las tablas usan `utf8mb4` para soportar caracteres especiales
4. **Engine**: Todas las tablas usan `InnoDB` para soportar transacciones y claves foráneas
5. **IF NOT EXISTS**: Los scripts usan esta cláusula para evitar errores si las tablas ya existen

## 🐛 Solución de Problemas

### Error: "Table already exists"
Los scripts usan `IF NOT EXISTS`, pero si necesitas recrear una tabla:

```sql
DROP TABLE IF EXISTS nombre_tabla;
```

### Error: "Foreign key constraint fails"
Verifica que las tablas dependientes existan antes de crear tablas con claves foráneas.

### Error: "Access denied"
Asegúrate de tener los permisos necesarios:

```sql
GRANT ALL PRIVILEGES ON nombre_base_datos.* TO 'usuario'@'localhost';
FLUSH PRIVILEGES;
```

## 📞 Soporte

Para problemas o preguntas sobre los scripts de base de datos, contacta al equipo de desarrollo.

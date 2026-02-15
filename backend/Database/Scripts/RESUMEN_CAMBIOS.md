# 📋 Resumen de Cambios - Scripts de Base de Datos

## 🎯 Problema Original

La tabla `users` no se estaba creando correctamente al ejecutar los scripts de base de datos.

## ✅ Solución Implementada

### 1. Script Maestro Actualizado
**Archivo**: `00_MASTER_CREATE_ALL_TABLES.sql`

**Cambios realizados**:
- ✅ Estructura completa de la tabla `users` corregida
- ✅ Todos los campos mapeados correctamente según el modelo C# `User.cs`
- ✅ Índices optimizados para búsquedas frecuentes
- ✅ Contraseña del usuario admin corregida (hash bcrypt válido)
- ✅ Orden de creación de tablas respetando dependencias de claves foráneas
- ✅ Tabla `system_configs` agregada (faltaba en el script anterior)
- ✅ Campos adicionales en `Activities` para auditoría detallada

**Estructura de la tabla users**:
```sql
CREATE TABLE `users` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `UserCode` VARCHAR(50) NOT NULL UNIQUE,
    `Password` VARCHAR(255) NOT NULL,
    `FirstName` VARCHAR(50) NULL,
    `LastName` VARCHAR(50) NULL,
    `Role` VARCHAR(50) NOT NULL DEFAULT 'Operario',
    `Permissions` JSON NULL,
    `ProfileImage` LONGTEXT NULL,
    `Email` VARCHAR(100) NULL,
    `Phone` VARCHAR(20) NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);
```

### 2. Script Individual de Users
**Archivo**: `01_CREATE_USERS_TABLE.sql`

Script independiente para crear solo la tabla `users` con el usuario administrador.

### 3. Script de Verificación
**Archivo**: `VERIFY_DATABASE.sql`

Script completo para diagnosticar el estado de la base de datos:
- Lista todas las tablas
- Cuenta registros en cada tabla
- Verifica estructura de tablas
- Muestra índices y claves foráneas
- Verifica procedimientos y eventos
- Muestra tamaño de tablas

### 4. Documentación Completa

**Archivos creados**:
- `README.md` - Documentación general de los scripts
- `INSTRUCCIONES_INSTALACION.md` - Guía paso a paso para instalación
- `RESUMEN_CAMBIOS.md` - Este archivo

## 📊 Tablas del Sistema

### Orden de Creación (respetando dependencias)

1. **users** ← Tabla base (sin dependencias)
2. **Activities** ← Depende de users
3. **refresh_tokens** ← Depende de users
4. **designs** ← Sin dependencias
5. **maquinas** ← Depende de users (created_by, updated_by)
6. **Documento** ← Sin dependencias
7. **condicionunica** ← Sin dependencias
8. **anilox** ← Sin dependencias
9. **machine_config** ← Sin dependencias
10. **maquinas_backup** ← Sin dependencias
11. **system_configs** ← Sin dependencias

### Relaciones de Claves Foráneas

```
users (Id)
  ├─→ Activities (UserId)
  ├─→ refresh_tokens (UserId)
  ├─→ maquinas (created_by)
  └─→ maquinas (updated_by)
```

## 🔐 Usuario Administrador

**Credenciales por defecto**:
- UserCode: `admin`
- Password: `admin123`
- Role: `Admin`
- IsActive: `1`

⚠️ **IMPORTANTE**: Cambiar la contraseña después de la primera instalación.

## 🛠️ Procedimientos Almacenados

### sp_backup_maquina
Crea backup de una máquina específica por OT SAP.

**Uso**:
```sql
CALL sp_backup_maquina('OT123', 'TERMINADO', 1, 'admin');
```

### sp_backup_maquinas_by_estado
Crea backups masivos de máquinas por estado.

**Uso**:
```sql
CALL sp_backup_maquinas_by_estado('TERMINADO', 'BACKUP_MASIVO', 1, 'admin');
```

## ⏰ Eventos Programados

### evt_cleanup_old_backups
Limpia automáticamente backups con más de 6 meses.

- **Frecuencia**: Diario
- **Hora**: 2:00 AM
- **Retención**: 6 meses

## 🔍 Características Técnicas

### Charset y Collation
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Engine**: `InnoDB`

### Índices Optimizados

**Tabla users**:
- `idx_users_usercode` - Búsqueda por código de usuario
- `idx_users_role` - Filtrado por rol
- `idx_users_active` - Filtrado por estado activo
- `idx_users_email` - Búsqueda por email

**Tabla maquinas**:
- `idx_maquinas_numero` - Búsqueda por número de máquina
- `idx_maquinas_articulo` - Búsqueda por artículo
- `idx_maquinas_estado` - Filtrado por estado
- `idx_maquinas_numero_estado` - Índice compuesto para consultas frecuentes

### Constraints de Validación

**Tabla users**:
- UserCode debe ser único
- Password es obligatorio
- Role tiene valor por defecto 'Operario'
- IsActive tiene valor por defecto 1

**Tabla maquinas**:
- numero_maquina debe estar entre 11 y 21
- kilos debe ser mayor a 0
- numero_colores debe estar entre 1 y 10
- estado debe ser uno de: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO, SIN_ASIGNAR

## 📝 Cambios Específicos vs Versión Anterior

### Correcciones en tabla users
1. ✅ Hash de contraseña corregido (era inválido)
2. ✅ Mapeo de columnas actualizado según entidad C#
3. ✅ Índices optimizados
4. ✅ Comentarios descriptivos agregados

### Correcciones en tabla maquinas
1. ✅ Nombres de columnas en snake_case (ot_sap, numero_maquina, etc.)
2. ✅ Tipo de dato correcto para kilos: DECIMAL(10,3)
3. ✅ Campo estado permite NULL (programas nuevos sin estado asignado)
4. ✅ Claves foráneas a users con ON DELETE SET NULL

### Correcciones en tabla Activities
1. ✅ Campos adicionales para auditoría detallada:
   - EntityType
   - EntityId
   - EntityName
   - Duration
   - OldValues
   - NewValues

### Tabla system_configs agregada
1. ✅ Nueva tabla para configuraciones del sistema
2. ✅ Soporte para diferentes tipos de datos (string, number, boolean, json)
3. ✅ Categorización de configuraciones

## 🚀 Cómo Usar

### Instalación Completa
```bash
mysql -u usuario -p flexoapp_bd < 00_MASTER_CREATE_ALL_TABLES.sql
```

### Verificación
```bash
mysql -u usuario -p flexoapp_bd < VERIFY_DATABASE.sql
```

### Solo Tabla Users
```bash
mysql -u usuario -p flexoapp_bd < 01_CREATE_USERS_TABLE.sql
```

## ✅ Checklist de Validación

Después de ejecutar el script maestro, verifica:

- [ ] 11 tablas creadas
- [ ] Tabla users existe con 13 columnas
- [ ] Usuario admin creado
- [ ] 4 índices en tabla users
- [ ] Claves foráneas configuradas correctamente
- [ ] 2 procedimientos almacenados creados
- [ ] 1 evento programado creado
- [ ] 11 registros en machine_config (máquinas 11-21)

## 🎓 Recomendaciones

1. **Backup**: Siempre haz backup antes de ejecutar en producción
2. **Permisos**: Verifica que el usuario tenga permisos CREATE, ALTER, DROP
3. **Charset**: Asegúrate que la base de datos use utf8mb4
4. **Event Scheduler**: Verifica que esté habilitado para los eventos automáticos
5. **Seguridad**: Cambia la contraseña del admin después de la instalación

## 📞 Soporte

Si encuentras problemas:
1. Ejecuta `VERIFY_DATABASE.sql` y guarda el output
2. Revisa los logs de MySQL
3. Verifica los permisos del usuario
4. Consulta `INSTRUCCIONES_INSTALACION.md` para soluciones comunes

---

**Fecha de actualización**: 2026-02-15  
**Versión**: 5.0  
**Autor**: Sistema FlexoAPP

# Base de Datos FlexoAPP

## 📋 Descripción General

Sistema de base de datos MySQL para FlexoAPP - Sistema de Gestión Flexográfica. Incluye gestión de usuarios, diseños, máquinas, documentos y ubicación de artículos.

## 🗂️ Estructura del Directorio

```
Database/
├── Scripts/              # Scripts de creación de tablas
│   ├── 00_MASTER_CREATE_ALL_TABLES.sql
│   ├── 01_CREATE_USERS_TABLE.sql
│   ├── 02_CREATE_ACTIVITIES_TABLE.sql
│   ├── 03_CREATE_DESIGNS_TABLE.sql
│   ├── 04_CREATE_MAQUINAS_TABLE.sql
│   ├── 07_CREATE_DOCUMENTO_TABLE.sql
│   ├── 08_CREATE_REFRESH_TOKENS_TABLE.sql
│   ├── 10_CREATE_CONDICIONUNICA_TABLE.sql
│   └── README.md
├── Migrations/           # Scripts de migración y actualizaciones
│   ├── ADD_ESTADO_COLUMN.sql
│   ├── ADD_ESTADO_COLUMN_RENDER.sql
│   ├── REMOVE_CURRENCY_CONFIG.sql
│   ├── REMOVE_EMAIL_NOTIFICATIONS.sql
│   ├── REMOVE_GENERAL_CATEGORY.sql
│   └── RENAME_REFERENCIA_TO_DESCRIPCION.sql
├── Migration_UpdateKilosDecimalPrecision.sql
└── README.md (este archivo)
```

## 🚀 Inicio Rápido

### 1. Crear Base de Datos

```sql
CREATE DATABASE IF NOT EXISTS flexoapp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE flexoapp_db;
```

### 2. Ejecutar Script Maestro

```sql
SOURCE backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql;
```

### 3. Verificar Instalación

```sql
SHOW TABLES;
SELECT * FROM users WHERE UserCode = 'admin';
```

## 📊 Tablas del Sistema

| # | Tabla | Descripción | Registros Típicos |
|---|-------|-------------|-------------------|
| 1 | users | Usuarios del sistema | 10-50 |
| 2 | Activities | Registro de actividades | 1000+ |
| 3 | designs | Diseños flexográficos | 500-2000 |
| 4 | maquinas | Programación de máquinas | 100-500 |
| 5 | Documento | Gestión documental | 50-200 |
| 6 | refresh_tokens | Tokens JWT | 10-100 |
| 7 | condicionunica | Ubicación de artículos | 500-2000 |

## 🔧 Configuración

### Requisitos
- MySQL 8.0 o superior
- Charset: utf8mb4
- Collation: utf8mb4_unicode_ci
- Motor: InnoDB

### Cadena de Conexión (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_db;User=root;Password=tu_password;"
  }
}
```

## 🔐 Seguridad

### Usuario Administrador por Defecto
```
UserCode: admin
Password: admin123
```

**⚠️ IMPORTANTE:** 
1. Cambiar la contraseña inmediatamente en producción
2. Crear usuarios específicos para cada rol
3. No usar el usuario admin para operaciones diarias

### Mejores Prácticas
- ✅ Usar contraseñas fuertes (mínimo 12 caracteres)
- ✅ Implementar rotación de tokens JWT
- ✅ Revisar logs de Activities regularmente
- ✅ Hacer respaldos diarios de la base de datos
- ✅ Usar conexiones SSL en producción

## 📈 Migraciones

Las migraciones se encuentran en `/Migrations/` y deben ejecutarse en orden cronológico:

1. **ADD_ESTADO_COLUMN.sql** - Agrega columna Estado a maquinas
2. **RENAME_REFERENCIA_TO_DESCRIPCION.sql** - Renombra columna en condicionunica
3. **REMOVE_CURRENCY_CONFIG.sql** - Elimina configuración de moneda
4. **REMOVE_EMAIL_NOTIFICATIONS.sql** - Elimina notificaciones por email
5. **REMOVE_GENERAL_CATEGORY.sql** - Elimina categoría general

### Ejecutar Migraciones

```sql
SOURCE backend/Database/Migrations/nombre_migracion.sql;
```

## 🔄 Respaldos

### Crear Respaldo

```bash
mysqldump -u root -p flexoapp_db > backup_$(date +%Y%m%d).sql
```

### Restaurar Respaldo

```bash
mysql -u root -p flexoapp_db < backup_20260117.sql
```

### Respaldo Automático (Recomendado)

Configurar cron job para respaldos diarios:

```bash
0 2 * * * /usr/bin/mysqldump -u root -p'password' flexoapp_db > /backups/flexoapp_$(date +\%Y\%m\%d).sql
```

## 📊 Monitoreo

### Verificar Tamaño de Tablas

```sql
SELECT 
    table_name AS 'Tabla',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamaño (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'flexoapp_db'
ORDER BY (data_length + index_length) DESC;
```

### Verificar Índices

```sql
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'flexoapp_db'
ORDER BY TABLE_NAME, INDEX_NAME;
```

### Actividad Reciente

```sql
SELECT 
    Action,
    Module,
    UserCode,
    Timestamp
FROM Activities
ORDER BY Timestamp DESC
LIMIT 20;
```

## 🛠️ Mantenimiento

### Optimizar Tablas

```sql
OPTIMIZE TABLE users, Activities, designs, maquinas, Documento, refresh_tokens, condicionunica;
```

### Limpiar Tokens Expirados

```sql
DELETE FROM refresh_tokens 
WHERE ExpiresAt < NOW() OR IsRevoked = 1;
```

### Limpiar Actividades Antiguas (opcional)

```sql
DELETE FROM Activities 
WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

## 📚 Documentación Adicional

- **Scripts:** Ver `/Scripts/README.md` para detalles de cada tabla
- **Migraciones:** Ver archivos individuales en `/Migrations/`
- **API:** Consultar documentación de controladores en `/backend/Controllers/`

## 🐛 Solución de Problemas

### Error: Table already exists
```sql
DROP TABLE IF EXISTS nombre_tabla;
-- Luego ejecutar el script de creación
```

### Error: Foreign key constraint fails
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Ejecutar operación
SET FOREIGN_KEY_CHECKS = 1;
```

### Error: Charset mismatch
```sql
ALTER DATABASE flexoapp_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en `/backend/logs/`
2. Verificar tabla Activities para auditoría
3. Consultar documentación de MySQL 8.0

## 🔄 Versión

**Versión Actual:** 2.0  
**Fecha:** 2026-01-17  
**MySQL Requerido:** 8.0+  
**Charset:** utf8mb4  
**Motor:** InnoDB

---

**Última Actualización:** 2026-01-17  
**Sistema:** FlexoAPP - Sistema de Gestión Flexográfica

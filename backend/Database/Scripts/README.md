# Scripts de Base de Datos - FlexoAPP

## 📋 Descripción

Este directorio contiene todos los scripts SQL para crear las tablas del sistema FlexoAPP. Los scripts están organizados y numerados para facilitar su ejecución en orden.

## 🗂️ Estructura de Scripts

### Script Maestro
- **00_MASTER_CREATE_ALL_TABLES.sql** - Crea todas las tablas en un solo script

### Scripts Individuales (en orden de ejecución)
1. **01_CREATE_USERS_TABLE.sql** - Tabla de usuarios del sistema
2. **02_CREATE_ACTIVITIES_TABLE.sql** - Registro de actividades y auditoría
3. **03_CREATE_DESIGNS_TABLE.sql** - Diseños flexográficos
4. **04_CREATE_MAQUINAS_TABLE.sql** - Máquinas de producción
5. **07_CREATE_DOCUMENTO_TABLE.sql** - Sistema de gestión documental
6. **08_CREATE_REFRESH_TOKENS_TABLE.sql** - Tokens JWT de actualización
7. **10_CREATE_CONDICIONUNICA_TABLE.sql** - Ubicación física de artículos

## 🚀 Uso

### Opción 1: Script Maestro (Recomendado)
Ejecuta el script maestro que crea todas las tablas en el orden correcto:

```sql
SOURCE backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql;
```

### Opción 2: Scripts Individuales
Ejecuta los scripts en el orden numérico:

```sql
SOURCE backend/Database/Scripts/01_CREATE_USERS_TABLE.sql;
SOURCE backend/Database/Scripts/02_CREATE_ACTIVITIES_TABLE.sql;
SOURCE backend/Database/Scripts/03_CREATE_DESIGNS_TABLE.sql;
SOURCE backend/Database/Scripts/04_CREATE_MAQUINAS_TABLE.sql;
SOURCE backend/Database/Scripts/07_CREATE_DOCUMENTO_TABLE.sql;
SOURCE backend/Database/Scripts/08_CREATE_REFRESH_TOKENS_TABLE.sql;
SOURCE backend/Database/Scripts/10_CREATE_CONDICIONUNICA_TABLE.sql;
```

## 📊 Tablas del Sistema

### 1. users
**Propósito:** Gestión de usuarios y autenticación
- Almacena información de usuarios del sistema
- Incluye roles y permisos
- Contraseñas hasheadas con bcrypt

### 2. Activities
**Propósito:** Auditoría y registro de actividades
- Registra todas las acciones del sistema
- Incluye información de usuario, módulo y timestamp
- Útil para auditoría y debugging

### 3. designs
**Propósito:** Catálogo de diseños flexográficos
- Almacena información de diseños
- Incluye colores, sustratos y especificaciones técnicas
- Relacionado con artículos F

### 4. maquinas
**Propósito:** Programación de máquinas de producción
- Gestiona órdenes de trabajo (OT SAP)
- Incluye información de programación y estado
- Relacionado con usuarios para auditoría

### 5. Documento
**Propósito:** Sistema de gestión documental
- Almacena metadatos de documentos
- Control de acceso y permisos
- Estadísticas de uso (vistas, descargas)

### 6. refresh_tokens
**Propósito:** Autenticación JWT
- Gestiona tokens de actualización
- Control de revocación y expiración
- Seguridad de sesiones

### 7. condicionunica
**Propósito:** Ubicación física de artículos
- Gestiona ubicación en estantes
- Organización de carpetas
- Estado de artículos

## 🔗 Relaciones entre Tablas

```
users (1) -----> (*) Activities
users (1) -----> (*) refresh_tokens
users (1) -----> (*) maquinas (CreatedBy, UpdatedBy)

designs (independiente)
Documento (independiente)
condicionunica (independiente)
```

## ⚙️ Características de los Scripts

### Seguridad
- ✅ Uso de `IF NOT EXISTS` para evitar errores
- ✅ Claves foráneas con `ON DELETE` y `ON UPDATE`
- ✅ Restricciones `CHECK` para validación de datos
- ✅ Índices únicos donde corresponde

### Optimización
- ✅ Índices en columnas frecuentemente consultadas
- ✅ Índices de texto completo para búsquedas
- ✅ Comentarios en todas las columnas
- ✅ Motor InnoDB para transacciones

### Auditoría
- ✅ Campos `CreatedAt` y `UpdatedAt` automáticos
- ✅ Registro de usuario creador y modificador
- ✅ Timestamps con precisión de microsegundos

## 📝 Notas Importantes

1. **Orden de Ejecución:** Respetar el orden numérico debido a las claves foráneas
2. **Charset:** Todos los scripts usan `utf8mb4` para soporte completo de Unicode
3. **Motor:** InnoDB para soporte de transacciones y claves foráneas
4. **Versión MySQL:** Requiere MySQL 8.0 o superior
5. **Datos Iniciales:** El script de users crea un usuario admin por defecto

## 🔐 Usuario Administrador por Defecto

```
UserCode: admin
Password: admin123
```

**⚠️ IMPORTANTE:** Cambiar la contraseña del administrador en producción.

## 🛠️ Mantenimiento

### Verificar Tablas Creadas
```sql
SHOW TABLES;
```

### Ver Estructura de una Tabla
```sql
DESCRIBE nombre_tabla;
```

### Contar Registros
```sql
SELECT COUNT(*) FROM nombre_tabla;
```

## 📚 Documentación Adicional

- Ver `/backend/Database/Migrations/` para scripts de migración
- Ver `/backend/Database/README.md` para información general
- Consultar el código fuente de los controladores para uso de las tablas

## 🔄 Versión

**Versión Actual:** 2.0  
**Fecha:** 2026-01-17  
**Autor:** Sistema FlexoAPP

---

**Última Actualización:** 2026-01-17

# 📁 Scripts de Base de Datos - FlexoAPP

Esta carpeta contiene los scripts SQL necesarios para configurar y mantener la base de datos **flexoapp_bd** de MySQL.

## 📋 Scripts Disponibles

### 🔧 Scripts de Configuración Principal

#### 1. `00_SetupDatabase.sql`
**Propósito:** Script de configuración inicial básica
- Crea la base de datos `flexoapp_bd`
- Crea la tabla `Users` con estructura completa
- Inserta el usuario administrador por defecto
- **Cuándo usar:** Primera instalación del sistema

**Ejecutar:**
```bash
mysql -u root -p flexoapp_bd < 00_SetupDatabase.sql
```

#### 2. `SETUP_COMPLETE_DATABASE.sql`
**Propósito:** Script completo de configuración con todas las tablas
- Crea la base de datos `flexoapp_bd`
- Crea tabla `Users` con usuario admin
- Crea tabla `Designs` con datos de ejemplo
- Crea tabla `DesignAudit` para auditoría
- Crea vistas y triggers automáticos
- **Cuándo usar:** Instalación completa desde cero

**Ejecutar:**
```bash
mysql -u root -p < SETUP_COMPLETE_DATABASE.sql
```

### 📊 Scripts de Tablas Específicas

#### 3. `create_condicionunica_flexoBD.sql`
**Propósito:** Crear tabla de condiciones únicas de artículos
- Tabla: `condicionunica`
- Almacena ubicación de artículos en estantes
- Incluye datos de prueba
- **Cuándo usar:** Si necesitas la funcionalidad de ubicación de artículos

**Ejecutar:**
```bash
mysql -u root -p flexoapp_bd < create_condicionunica_flexoBD.sql
```

#### 4. `CrearYPoblarTablaMaquinas.sql`
**Propósito:** Crear y poblar tabla de máquinas flexográficas
- Tabla: `maquinas`
- Clave primaria: `articulo` (sin campo id)
- Incluye 15 registros de prueba distribuidos en máquinas 11-15
- Comentarios detallados en español
- **Cuándo usar:** Para gestionar programas de máquinas

**Ejecutar:**
```bash
mysql -u root -p flexoapp_bd < CrearYPoblarTablaMaquinas.sql
```

#### 5. `create_machine_programs_table.sql`
**Propósito:** Crear tabla de programas de máquinas
- Tabla: `machine_programs`
- Estructura compatible con Entity Framework
- Índices optimizados para consultas
- **Cuándo usar:** Si usas la tabla machine_programs en lugar de maquinas

**Ejecutar:**
```bash
mysql -u root -p flexoapp_bd < create_machine_programs_table.sql
```

### 🔄 Scripts de Migración

#### 6. `QUICK_FIX_COLORS.sql`
**Propósito:** Migrar colores de JSON a columnas individuales
- Convierte columna `Colors` (JSON) a `Color1`, `Color2`, ..., `Color10`
- Migra datos existentes automáticamente
- Limpia valores nulos
- **Cuándo usar:** Si necesitas migrar de estructura JSON a columnas separadas

**Ejecutar:**
```bash
mysql -u root -p flexoapp_bd < QUICK_FIX_COLORS.sql
```

## 🚀 Orden de Ejecución Recomendado

### Para Instalación Nueva Completa:
```bash
# Opción 1: Script completo (recomendado)
mysql -u root -p < SETUP_COMPLETE_DATABASE.sql

# Opción 2: Scripts individuales
mysql -u root -p < 00_SetupDatabase.sql
mysql -u root -p flexoapp_bd < create_condicionunica_flexoBD.sql
mysql -u root -p flexoapp_bd < CrearYPoblarTablaMaquinas.sql
mysql -u root -p flexoapp_bd < create_machine_programs_table.sql
```

### Para Instalación Básica:
```bash
# Solo lo esencial
mysql -u root -p < 00_SetupDatabase.sql
```

## 📝 Notas Importantes

### Base de Datos
- **Nombre:** `flexoapp_bd`
- **Charset:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci`
- **Puerto:** 3306 (por defecto)

### Usuario Administrador por Defecto
- **UserCode:** admin
- **Password:** admin123
- **Rol:** Admin
- ⚠️ **IMPORTANTE:** Cambiar esta contraseña en producción

### Tablas Principales
1. **users** - Usuarios del sistema
2. **designs** - Diseños flexográficos
3. **maquinas** - Programas de máquinas (clave primaria: articulo)
4. **machine_programs** - Programas de máquinas (clave primaria: Id)
5. **condicionunica** - Ubicación de artículos
6. **activities** - Auditoría de acciones

### Diferencia entre `maquinas` y `machine_programs`
- **maquinas:** Usa `articulo` como clave primaria (sin campo id)
- **machine_programs:** Usa `Id` como clave primaria autoincremental
- Ambas tablas sirven el mismo propósito, elige una según tu necesidad

## 🔍 Verificación

Después de ejecutar los scripts, verifica que todo esté correcto:

```sql
-- Conectar a MySQL
mysql -u root -p

-- Verificar que la base de datos existe
SHOW DATABASES LIKE 'flexoapp_bd';

-- Usar la base de datos
USE flexoapp_bd;

-- Ver todas las tablas
SHOW TABLES;

-- Verificar usuarios
SELECT Id, UserCode, Role, IsActive FROM users;

-- Verificar diseños
SELECT COUNT(*) as total FROM designs;

-- Verificar máquinas
SELECT numero_maquina, COUNT(*) as total FROM maquinas GROUP BY numero_maquina;
```

## 🛠️ Solución de Problemas

### Error: "Access denied"
```bash
# Verificar usuario y contraseña
mysql -u root -p
```

### Error: "Unknown database"
```bash
# Crear la base de datos manualmente
mysql -u root -p -e "CREATE DATABASE flexoapp_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Error: "Table already exists"
- Los scripts usan `CREATE TABLE IF NOT EXISTS`, no deberían dar error
- Si necesitas recrear una tabla, elimínala primero: `DROP TABLE nombre_tabla;`

## 📚 Documentación Adicional

Para más información sobre la configuración de la base de datos, consulta:
- [DATABASE_CONFIG.md](../../../DATABASE_CONFIG.md) - Documentación completa de configuración
- [README.md](../../../README.md) - Documentación general del proyecto

## 🔐 Seguridad

- Nunca subas contraseñas reales a GitHub
- Cambia las contraseñas por defecto en producción
- Usa variables de entorno para credenciales sensibles
- Limita los permisos de usuarios de base de datos

## 📞 Soporte

Si tienes problemas con los scripts:
1. Verifica que MySQL esté instalado y corriendo
2. Verifica la cadena de conexión en `appsettings.json`
3. Revisa los logs de la aplicación en la carpeta `logs/`
4. Consulta la documentación en `DATABASE_CONFIG.md`

# Configuración de Actividades de Usuario - FlexoAPP

Este directorio contiene los scripts necesarios para configurar la tabla de actividades de usuario y cargar datos de prueba para el módulo de reportes.

## 📋 Archivos Incluidos

### Scripts SQL
1. **CREATE_USER_ACTIVITIES_TABLE.sql**
   - Crea la tabla `UserActivities` en la base de datos FlexoAPP
   - Define la estructura para almacenar actividades de usuario
   - Incluye índices para optimizar consultas

2. **INSERT_USER_ACTIVITIES_TEST_DATA.sql**
   - Inserta 72 actividades de prueba
   - Distribuidas entre 4 usuarios diferentes
   - Cubre los últimos 5 días
   - Incluye actividades de todos los módulos del sistema

### Script de Automatización
3. **SETUP_USER_ACTIVITIES.ps1**
   - Script PowerShell que ejecuta automáticamente ambos archivos SQL
   - Verifica la instalación de herramientas necesarias
   - Proporciona feedback visual del progreso
   - Muestra resumen de datos insertados

## 🚀 Ejecución Rápida

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Ejecutar desde PowerShell en el directorio backend/Database
.\SETUP_USER_ACTIVITIES.ps1
```

### Opción 2: Ejecución Manual

```powershell
# 1. Crear la tabla
sqlcmd -S localhost -d FlexoAPP -U flexoapp_user -P FlexoApp2024! -i CREATE_USER_ACTIVITIES_TABLE.sql

# 2. Insertar datos de prueba
sqlcmd -S localhost -d FlexoAPP -U flexoapp_user -P FlexoApp2024! -i INSERT_USER_ACTIVITIES_TEST_DATA.sql
```

## 📊 Datos de Prueba Insertados

### Usuarios y Actividades

| Usuario | Actividades | Rol Principal |
|---------|-------------|---------------|
| admin | 25 | Administrador del sistema |
| operator01 | 19 | Operador de máquinas |
| designer01 | 16 | Diseñador gráfico |
| manager01 | 12 | Gerente/Supervisor |
| **Total** | **72** | |

### Distribución por Módulo

- **MACHINES** (Máquinas): ~30 actividades
- **AUTH** (Autenticación): ~17 actividades
- **DESIGN** (Diseño): ~15 actividades
- **PROFILE** (Perfil): ~5 actividades
- **REPORTS** (Reportes): ~3 actividades
- **SETTINGS** (Configuración): ~2 actividades

### Tipos de Actividades Incluidas

#### Autenticación (AUTH)
- LOGIN - Inicio de sesión
- LOGOUT - Cierre de sesión

#### Perfil (PROFILE)
- VIEW_PROFILE - Visualización de perfil
- UPDATE_PROFILE - Actualización de información
- CHANGE_PASSWORD - Cambio de contraseña

#### Máquinas (MACHINES)
- VIEW_MACHINES - Consulta de máquinas
- CREATE_MACHINE - Creación de máquina
- UPDATE_MACHINE - Actualización de configuración
- DELETE_MACHINE - Eliminación de máquina
- START_MACHINE - Inicio de operación
- PAUSE_MACHINE - Pausa de operación
- RESUME_MACHINE - Reanudación de operación
- STOP_MACHINE - Detención de máquina
- COMPLETE_ORDER - Finalización de orden

#### Diseño (DESIGN)
- VIEW_DESIGNS - Consulta de diseños
- CREATE_DESIGN - Creación de diseño
- UPDATE_DESIGN - Modificación de diseño
- DUPLICATE_DESIGN - Duplicación de diseño

#### Reportes (REPORTS)
- VIEW_REPORTS - Acceso al módulo
- GENERATE_REPORT - Generación de reporte
- EXPORT_PDF - Exportación a PDF

#### Configuración (SETTINGS)
- VIEW_SETTINGS - Acceso a configuraciones
- UPDATE_SETTINGS - Actualización de configuraciones
- CREATE_USER - Creación de usuario
- UPDATE_USER - Actualización de usuario

## 🔍 Verificación de Datos

Después de ejecutar los scripts, puedes verificar los datos con estas consultas:

```sql
-- Ver total de actividades
SELECT COUNT(*) AS TotalActividades FROM UserActivities;

-- Ver actividades por usuario
SELECT UserCode, COUNT(*) AS Cantidad
FROM UserActivities
GROUP BY UserCode
ORDER BY Cantidad DESC;

-- Ver actividades por módulo
SELECT Module, COUNT(*) AS Cantidad
FROM UserActivities
GROUP BY Module
ORDER BY Cantidad DESC;

-- Ver actividades recientes
SELECT TOP 10 
    UserCode,
    Action,
    Description,
    Module,
    Timestamp
FROM UserActivities
ORDER BY Timestamp DESC;

-- Ver actividades de un usuario específico
SELECT 
    Action,
    Description,
    Module,
    Component,
    Timestamp
FROM UserActivities
WHERE UserCode = 'admin'
ORDER BY Timestamp DESC;
```

## 🧪 Probar el Módulo de Reportes

Una vez ejecutados los scripts, puedes probar el módulo de reportes:

1. **Iniciar la aplicación**
   ```bash
   # Backend
   cd backend
   dotnet run

   # Frontend
   cd Frontend
   npm start
   ```

2. **Acceder al módulo de reportes**
   - Navegar a: http://localhost:4200/reports
   - Iniciar sesión con cualquier usuario

3. **Buscar actividades**
   - Código de usuario: `admin`, `operator01`, `designer01`, o `manager01`
   - Módulo: Seleccionar cualquier módulo o "Todos"
   - Rango de fechas: Últimos 7 días

4. **Exportar reportes**
   - Hacer clic en "Exportar PDF" para generar un reporte

## 📝 Estructura de la Tabla

```sql
CREATE TABLE UserActivities (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    UserCode NVARCHAR(50) NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    Module NVARCHAR(50) NOT NULL,
    Component NVARCHAR(100) NOT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    ExpiryDate DATETIME2 NULL,
    Metadata NVARCHAR(MAX) NULL
);
```

### Índices
- `IX_UserActivities_UserCode` - Búsqueda por usuario
- `IX_UserActivities_Module` - Filtrado por módulo
- `IX_UserActivities_Timestamp` - Ordenamiento por fecha
- `IX_UserActivities_UserCode_Timestamp` - Búsqueda combinada

## ⚠️ Notas Importantes

1. **Datos de Prueba**: Los scripts eliminan datos existentes antes de insertar. No usar en producción.

2. **Credenciales**: Los scripts usan las credenciales por defecto:
   - Usuario: `flexoapp_user`
   - Contraseña: `FlexoApp2024!`
   - Modificar en el script si son diferentes

3. **Requisitos**:
   - SQL Server instalado y en ejecución
   - Base de datos FlexoAPP creada
   - SQL Server Command Line Utilities (sqlcmd)

4. **Rango de Fechas**: Las actividades se generan para los últimos 5 días desde la fecha de ejecución.

## 🔧 Solución de Problemas

### Error: "sqlcmd no está disponible"
**Solución**: Instalar SQL Server Command Line Utilities
- Descargar desde: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility

### Error: "Login failed for user"
**Solución**: Verificar credenciales en el script PowerShell
- Editar `SETUP_USER_ACTIVITIES.ps1`
- Actualizar variables `$Username` y `$Password`

### Error: "Database does not exist"
**Solución**: Crear la base de datos FlexoAPP primero
```sql
CREATE DATABASE FlexoAPP;
```

## 📞 Soporte

Si encuentras problemas, verifica:
1. SQL Server está en ejecución
2. Base de datos FlexoAPP existe
3. Credenciales son correctas
4. sqlcmd está instalado

---

**Última actualización**: 2024-11-21
**Versión**: 1.0.0

# Sistema de Auditoría y Reportes - Implementación Completa

## ✅ Resumen de Implementación

Se ha implementado un sistema completo de auditoría que registra automáticamente todas las actividades de los usuarios en la aplicación FlexoAPP.

## 📋 Módulos Implementados

### 1. **Autenticación (AUTH)** ✅
- ✅ Login exitoso (con navegador e IP)
- ✅ Login fallido
- ✅ Logout

**Ubicación**: `backend/Controllers/AuthController.cs`

### 2. **Perfil de Usuario (PROFILE)** ✅
- ✅ Cambio de foto de perfil
- ✅ Cambio de contraseña (exitoso y fallido)
- ✅ Cambio de nombre
- ✅ Actualización de información

**Ubicación**: `backend/Controllers/AuthController.cs`, `backend/Controllers/UsersController.cs`

### 3. **Máquinas (MACHINES)** ✅
- ✅ Cambio de estado de máquina
- ✅ Cálculo automático de duración (PREPARANDO → LISTO)
- ✅ Registro de artículo, descripción y número de máquina
- ✅ Registro de tiempo entre eventos

**Ubicación**: `backend/Services/MaquinaService.cs`

### 4. **Diseños (DESIGNS)** ✅
- ✅ Creación de diseño
- ✅ Modificación de diseño
- ✅ Eliminación de diseño
- ✅ Registro de artículo y descripción

**Ubicación**: `backend/Controllers/DesignsController.cs`

### 5. **Reportes (REPORTS)** ✅
- ✅ Consulta de resumen de reportes
- ✅ Consulta de reporte de producción
- ✅ Registro de filtros aplicados
- ✅ Registro de código consultado

**Ubicación**: `backend/Controllers/ReportsController.cs`

### 6. **Configuración (CONFIG/SETTINGS)** ✅
- ✅ Cambio de ajustes del sistema
- ✅ Creación de usuarios
- ✅ Actualización de usuarios
- ✅ Eliminación de usuarios
- ✅ Registro de valores anteriores y nuevos

**Ubicación**: `backend/Controllers/SystemConfigController.cs`, `backend/Controllers/UsersController.cs`

## 🗄️ Estructura de Base de Datos

### Tabla Activities (Actualizada)

```sql
CREATE TABLE Activities (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Action VARCHAR(200) NOT NULL,
    Description VARCHAR(500) NOT NULL,
    Timestamp DATETIME NOT NULL,
    Module VARCHAR(100) NOT NULL,
    Details VARCHAR(1000),
    UserId INT NOT NULL,
    UserCode VARCHAR(50),
    IpAddress VARCHAR(45),
    
    -- Nuevas columnas para auditoría detallada
    EntityType VARCHAR(100),        -- Tipo de entidad (Maquina, Design, User, etc.)
    EntityId INT,                   -- ID de la entidad
    EntityName VARCHAR(200),        -- Nombre/código de la entidad
    Duration BIGINT,                -- Duración en ticks (TimeSpan)
    OldValues VARCHAR(2000),        -- Valores anteriores (JSON)
    NewValues VARCHAR(2000),        -- Valores nuevos (JSON)
    
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

### Índices Creados

```sql
CREATE INDEX idx_activities_entity ON Activities(EntityType, EntityId);
CREATE INDEX idx_activities_module_timestamp ON Activities(Module, Timestamp DESC);
CREATE INDEX idx_activities_user_timestamp ON Activities(UserId, Timestamp DESC);
```

## 🔧 Archivos Modificados/Creados

### Backend

1. **Modelos**
   - ✅ `backend/Models/Entities/Activity.cs` - Actualizado con nuevas columnas

2. **Servicios**
   - ✅ `backend/Services/ActivityLoggerService.cs` - Agregado método `LogDetailedActivityAsync`
   - ✅ `backend/Services/MaquinaService.cs` - Agregado logging de cambios de estado con duración

3. **Controladores**
   - ✅ `backend/Controllers/AuthController.cs` - Login/Logout/Cambio de contraseña
   - ✅ `backend/Controllers/UsersController.cs` - Gestión de usuarios
   - ✅ `backend/Controllers/DesignsController.cs` - Operaciones con diseños
   - ✅ `backend/Controllers/ReportsController.cs` - Consultas de reportes
   - ✅ `backend/Controllers/SystemConfigController.cs` - Cambios de configuración
   - ✅ `backend/Controllers/AuditController.cs` - **NUEVO** - Endpoints de consulta de auditoría

4. **Migraciones**
   - ✅ `backend/Database/Migrations/ADD_AUDIT_COLUMNS_TO_ACTIVITIES.sql` - Script de migración

5. **Documentación**
   - ✅ `backend/Controllers/README_AUDIT_SYSTEM.md` - Documentación completa del sistema

## 🌐 API Endpoints de Auditoría

### Base URL: `/api/audit`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/activities` | GET | Obtener todas las actividades con filtros |
| `/auth-activities` | GET | Actividades de login/logout |
| `/profile-activities` | GET | Cambios de perfil |
| `/machine-activities` | GET | Operaciones con máquinas |
| `/design-activities` | GET | Operaciones con diseños |
| `/report-activities` | GET | Consultas de reportes |
| `/config-activities` | GET | Cambios de configuración |
| `/stats` | GET | Estadísticas de actividades |
| `/entity-history` | GET | Historial de una entidad específica |

## 📊 Información Registrada por Módulo

### Autenticación
- ✅ Fecha y hora
- ✅ Usuario
- ✅ IP del cliente
- ✅ Navegador
- ✅ Resultado (éxito/fallo)

### Perfil
- ✅ Fecha y hora
- ✅ Usuario
- ✅ Campo modificado
- ✅ Valores anteriores y nuevos (excepto contraseñas)

### Máquinas
- ✅ Fecha y hora
- ✅ Usuario
- ✅ OT SAP
- ✅ Artículo y descripción
- ✅ Número de máquina
- ✅ Estado anterior y nuevo
- ✅ **Duración entre estados** (PREPARANDO → LISTO)
- ✅ Observaciones

### Diseños
- ✅ Fecha y hora
- ✅ Usuario
- ✅ ID del diseño
- ✅ Artículo y descripción
- ✅ Cliente
- ✅ Acción (crear/modificar/eliminar)

### Reportes
- ✅ Fecha y hora
- ✅ Usuario
- ✅ Tipo de reporte
- ✅ Filtros aplicados
- ✅ Código consultado

### Configuración
- ✅ Fecha y hora
- ✅ Usuario administrador
- ✅ Tipo de configuración
- ✅ Valores anteriores y nuevos
- ✅ Usuario afectado (si aplica)

## 🚀 Pasos para Activar el Sistema

### 1. Ejecutar Migración de Base de Datos

```bash
# Opción 1: Desde MySQL Workbench o cliente MySQL
mysql -u root -p flexoapp < backend/Database/Migrations/ADD_AUDIT_COLUMNS_TO_ACTIVITIES.sql

# Opción 2: Desde la aplicación (se puede crear un endpoint temporal)
```

### 2. Verificar que el Servicio está Registrado

En `backend/Program.cs`, verificar que está registrado:

```csharp
builder.Services.AddScoped<IActivityLoggerService, ActivityLoggerService>();
```

### 3. Probar los Endpoints

```bash
# Obtener todas las actividades
GET http://localhost:5000/api/audit/activities

# Obtener actividades de login
GET http://localhost:5000/api/audit/auth-activities

# Obtener estadísticas
GET http://localhost:5000/api/audit/stats
```

## 📈 Ejemplos de Uso

### Consultar actividades de un usuario específico

```http
GET /api/audit/activities?userId=5&startDate=2026-01-01&endDate=2026-01-31
```

### Consultar cambios de estado de una máquina

```http
GET /api/audit/machine-activities?machineId=1&startDate=2026-01-27
```

### Obtener historial completo de un diseño

```http
GET /api/audit/entity-history?entityType=Design&entityId=123
```

### Ver estadísticas del último mes

```http
GET /api/audit/stats?startDate=2025-12-27&endDate=2026-01-27
```

## 🎯 Características Especiales

### Cálculo Automático de Duración

Cuando una máquina cambia de estado **PREPARANDO** a **LISTO**, el sistema:
1. Registra la fecha/hora de inicio cuando entra en PREPARANDO
2. Calcula la duración cuando cambia a LISTO
3. Almacena la duración en formato TimeSpan
4. Limpia la fecha de inicio

### Valores Anteriores y Nuevos

Para cambios importantes (configuración, perfil, máquinas), se almacenan:
- **OldValues**: Estado anterior en formato JSON
- **NewValues**: Estado nuevo en formato JSON

Esto permite:
- Ver exactamente qué cambió
- Revertir cambios si es necesario
- Análisis de tendencias

### Seguridad

- ❌ Las contraseñas NUNCA se almacenan en OldValues/NewValues
- ✅ Solo se registra que hubo un cambio de contraseña
- ✅ Se registra la IP del cliente para auditoría de seguridad

## 📱 Próximos Pasos (Frontend)

Para completar el sistema, se recomienda crear en el frontend:

1. **Dashboard de Auditoría**
   - Gráficos de actividades por módulo
   - Timeline de eventos
   - Filtros avanzados

2. **Vistas Específicas**
   - Historial de login por usuario
   - Reporte de cambios de máquinas con tiempos
   - Historial de cambios de configuración

3. **Exportación**
   - Exportar auditoría a Excel
   - Exportar auditoría a PDF
   - Programar reportes automáticos

## 🔍 Verificación

Para verificar que el sistema está funcionando:

1. Iniciar sesión → Verificar registro en Activities
2. Cambiar estado de una máquina → Verificar duración calculada
3. Modificar un diseño → Verificar valores anteriores/nuevos
4. Cambiar configuración → Verificar registro de cambio

```sql
-- Ver últimas 10 actividades
SELECT * FROM Activities ORDER BY Timestamp DESC LIMIT 10;

-- Ver actividades de máquinas con duración
SELECT * FROM Activities 
WHERE Module = 'MACHINES' AND Duration IS NOT NULL 
ORDER BY Timestamp DESC;

-- Ver cambios de configuración
SELECT * FROM Activities 
WHERE Module = 'CONFIG' 
ORDER BY Timestamp DESC;
```

## ✨ Resumen

El sistema de auditoría está completamente implementado y registra automáticamente:

- ✅ Todos los login/logout con IP y navegador
- ✅ Todos los cambios de perfil (foto, nombre, contraseña)
- ✅ Todos los cambios de estado de máquinas con duración calculada
- ✅ Todas las operaciones con diseños (crear, modificar, eliminar)
- ✅ Todas las consultas de reportes con filtros
- ✅ Todos los cambios de configuración con valores anteriores/nuevos

El sistema está listo para usar y proporciona endpoints completos para consultar toda la información de auditoría.

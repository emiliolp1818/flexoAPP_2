# Sistema de Auditoría y Reportes de Actividades

## Descripción General

El sistema de auditoría registra automáticamente todas las actividades de los usuarios en diferentes módulos de la aplicación FlexoAPP. Cada acción importante queda registrada con información detallada incluyendo fecha, hora, usuario, tipo de acción, y datos específicos del evento.

## Módulos Auditados

### 1. **Autenticación (AUTH)**
Registra eventos de inicio y cierre de sesión:
- ✅ **LOGIN_SUCCESS**: Inicio de sesión exitoso
- ✅ **LOGIN_FAILED**: Intento fallido de inicio de sesión
- ✅ **LOGOUT**: Cierre de sesión

**Información registrada:**
- Fecha y hora del evento
- Usuario que inició/cerró sesión
- Dirección IP del cliente
- Navegador utilizado
- Resultado de la operación

### 2. **Perfil de Usuario (PROFILE)**
Registra cambios en el perfil del usuario:
- ✅ **PROFILE_PHOTO_UPDATED**: Cambio de foto de perfil
- ✅ **PROFILE_PASSWORD_UPDATED**: Cambio de contraseña exitoso
- ✅ **PROFILE_PASSWORD_UPDATE_FAILED**: Intento fallido de cambio de contraseña
- ✅ **PROFILE_NAME_UPDATED**: Cambio de nombre
- ✅ **PROFILE_INFO_UPDATED**: Actualización de información del perfil

**Información registrada:**
- Fecha y hora del cambio
- Usuario que realizó el cambio
- Campo modificado
- Valores anteriores y nuevos (excepto contraseñas)

### 3. **Máquinas (MACHINES)**
Registra todas las operaciones con máquinas:
- ✅ **MACHINE_STATUS_CHANGED**: Cambio de estado de máquina
- ✅ **MACHINE_CREATED**: Creación de nueva máquina
- ✅ **MACHINE_UPDATED**: Actualización de datos de máquina
- ✅ **MACHINE_DELETED**: Eliminación de máquina

**Información registrada:**
- Fecha y hora del evento
- Usuario que realizó la acción
- OT SAP de la máquina
- Artículo y descripción
- Número de máquina
- Estado anterior y nuevo
- **Duración**: Tiempo transcurrido entre estados (especialmente PREPARANDO → LISTO)
- Observaciones

**Cálculo de Tiempos:**
- Cuando una máquina cambia de PREPARANDO a LISTO, se calcula automáticamente el tiempo transcurrido
- La duración se almacena en formato TimeSpan para análisis posterior

### 4. **Diseños (DESIGNS)**
Registra operaciones con diseños:
- ✅ **CREATE_DESIGN**: Creación de nuevo diseño
- ✅ **UPDATE_DESIGN**: Modificación de diseño existente
- ✅ **DELETE_DESIGN**: Eliminación de diseño
- ✅ **DUPLICATE_DESIGN**: Duplicación de diseño

**Información registrada:**
- Fecha y hora del evento
- Usuario que realizó la acción
- ID del diseño
- Artículo y descripción
- Cliente
- Valores anteriores y nuevos (en modificaciones)

### 5. **Reportes (REPORTS)**
Registra consultas de reportes:
- ✅ **VIEW_REPORT_SUMMARY**: Consulta de resumen de reportes
- ✅ **VIEW_PRODUCTION_REPORT**: Consulta de reporte de producción
- ✅ **VIEW_MACHINE_REPORT**: Consulta de reporte de máquinas
- ✅ **VIEW_AUDIT**: Consulta de auditoría del sistema
- ✅ **EXPORT_REPORT**: Exportación de reporte

**Información registrada:**
- Fecha y hora de la consulta
- Usuario que consultó
- Tipo de reporte
- Filtros aplicados (fechas, máquinas, estados, etc.)
- Cantidad de registros consultados

### 6. **Configuración (CONFIG/SETTINGS)**
Registra cambios en la configuración del sistema:
- ✅ **CONFIG_UPDATED**: Cambio de configuración del sistema
- ✅ **USER_CREATED**: Creación de nuevo usuario
- ✅ **USER_UPDATED**: Actualización de usuario
- ✅ **USER_DELETED**: Eliminación de usuario
- ✅ **USER_STATUS_CHANGED**: Cambio de estado de usuario (activo/inactivo)

**Información registrada:**
- Fecha y hora del cambio
- Usuario administrador que realizó el cambio
- Tipo de configuración modificada
- Valores anteriores y nuevos
- Usuario afectado (en operaciones de usuarios)

## Endpoints de Consulta de Auditoría

### Base URL: `/api/audit`

#### 1. Obtener todas las actividades
```http
GET /api/audit/activities?userId={userId}&module={module}&action={action}&startDate={date}&endDate={date}&page={page}&pageSize={size}
```

**Parámetros opcionales:**
- `userId`: Filtrar por ID de usuario
- `module`: Filtrar por módulo (AUTH, PROFILE, MACHINES, DESIGNS, REPORTS, CONFIG)
- `action`: Filtrar por acción específica
- `startDate`: Fecha de inicio (formato: YYYY-MM-DD)
- `endDate`: Fecha de fin (formato: YYYY-MM-DD)
- `page`: Número de página (default: 1)
- `pageSize`: Registros por página (default: 50)

#### 2. Actividades de autenticación
```http
GET /api/audit/auth-activities?userId={userId}&startDate={date}&endDate={date}
```

#### 3. Actividades de perfil
```http
GET /api/audit/profile-activities?userId={userId}&startDate={date}&endDate={date}
```

#### 4. Actividades de máquinas
```http
GET /api/audit/machine-activities?machineId={id}&startDate={date}&endDate={date}
```

#### 5. Actividades de diseños
```http
GET /api/audit/design-activities?designId={id}&startDate={date}&endDate={date}
```

#### 6. Actividades de reportes
```http
GET /api/audit/report-activities?userId={userId}&startDate={date}&endDate={date}
```

#### 7. Actividades de configuración
```http
GET /api/audit/config-activities?startDate={date}&endDate={date}
```

#### 8. Estadísticas de actividades
```http
GET /api/audit/stats?startDate={date}&endDate={date}
```

Retorna:
- Total de actividades
- Actividades por módulo
- Actividades por acción (top 10)
- Actividades por usuario (top 10)
- Actividades recientes (últimas 10)

#### 9. Historial de una entidad específica
```http
GET /api/audit/entity-history?entityType={type}&entityId={id}
```

Retorna todo el historial de cambios de una entidad específica (máquina, diseño, usuario, etc.)

## Estructura de Datos

### Tabla Activities

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
    EntityType VARCHAR(100),
    EntityId INT,
    EntityName VARCHAR(200),
    Duration BIGINT,  -- TimeSpan en ticks
    OldValues VARCHAR(2000),  -- JSON
    NewValues VARCHAR(2000),  -- JSON
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

### Índices para Optimización

```sql
CREATE INDEX idx_activities_entity ON Activities(EntityType, EntityId);
CREATE INDEX idx_activities_module_timestamp ON Activities(Module, Timestamp DESC);
CREATE INDEX idx_activities_user_timestamp ON Activities(UserId, Timestamp DESC);
```

## Ejemplo de Respuesta

```json
{
  "id": 123,
  "action": "MACHINE_STATUS_CHANGED",
  "description": "Cambio de estado: PREPARANDO → LISTO (Duración: 45.50 min)",
  "timestamp": "2026-01-27T14:30:00Z",
  "module": "MACHINES",
  "details": "{\"otSap\":\"12345\",\"articulo\":\"ART-001\",\"descripcion\":\"Producto X\",\"maquina\":1}",
  "userId": 5,
  "userCode": "operador01",
  "ipAddress": "192.168.1.100",
  "entityType": "Maquina",
  "entityId": null,
  "entityName": "12345 - ART-001",
  "duration": "00:45:30",
  "oldValues": "{\"estado\":\"PREPARANDO\",\"observaciones\":null}",
  "newValues": "{\"estado\":\"LISTO\",\"observaciones\":\"Listo para producción\"}",
  "user": {
    "userCode": "operador01",
    "fullName": "Juan Pérez"
  }
}
```

## Migración de Base de Datos

Para agregar las nuevas columnas de auditoría, ejecutar el script:

```bash
mysql -u root -p flexoapp < backend/Database/Migrations/ADD_AUDIT_COLUMNS_TO_ACTIVITIES.sql
```

## Uso en el Código

### Registrar actividad simple
```csharp
await _activityLogger.LogActivityAsync(
    action: "LOGIN_SUCCESS",
    description: "Inicio de sesión exitoso",
    module: "AUTH"
);
```

### Registrar actividad detallada
```csharp
await _activityLogger.LogDetailedActivityAsync(
    action: "MACHINE_STATUS_CHANGED",
    description: "Cambio de estado: PREPARANDO → LISTO",
    module: "MACHINES",
    entityType: "Maquina",
    entityName: "12345 - ART-001",
    duration: TimeSpan.FromMinutes(45.5),
    oldValues: new { estado = "PREPARANDO" },
    newValues: new { estado = "LISTO" },
    details: "{\"otSap\":\"12345\",\"maquina\":1}"
);
```

## Consideraciones de Seguridad

1. **Contraseñas**: Nunca se almacenan contraseñas en los campos OldValues/NewValues
2. **Datos sensibles**: Se debe tener cuidado con información confidencial en los detalles
3. **Retención**: Considerar políticas de retención de datos de auditoría
4. **Acceso**: Solo usuarios con permisos de administrador deben acceder a la auditoría completa

## Reportes Disponibles

1. **Reporte de Login/Logout**: Muestra todos los inicios y cierres de sesión
2. **Reporte de Cambios de Perfil**: Historial de modificaciones de perfil por usuario
3. **Reporte de Operaciones de Máquinas**: Todas las operaciones con tiempos de duración
4. **Reporte de Gestión de Diseños**: Creación, modificación y eliminación de diseños
5. **Reporte de Consultas**: Qué reportes consulta cada usuario
6. **Reporte de Configuración**: Cambios en la configuración del sistema

## Próximas Mejoras

- [ ] Dashboard de auditoría en el frontend
- [ ] Exportación de auditoría a Excel/PDF
- [ ] Alertas automáticas para eventos críticos
- [ ] Análisis de patrones de uso
- [ ] Retención automática de datos antiguos

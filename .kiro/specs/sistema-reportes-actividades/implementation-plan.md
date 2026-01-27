# Plan de Implementación - Sistema de Reportes de Actividades

## Estado Actual
✅ Tabla `Activities` existe en la base de datos
✅ Servicio `ActivityLoggerService` implementado y funcional
✅ Algunos controladores ya registran actividades (MaquinasController)

## Fase 1: Backend - Integración de Logging (PRIORIDAD ALTA)

### 1.1 AuthController - Login/Logout
- [ ] Registrar inicio de sesión exitoso
- [ ] Registrar cierre de sesión
- [ ] Registrar intentos fallidos de login
- [ ] Capturar IP en todos los eventos de autenticación

**Acciones:**
- `LOGIN_SUCCESS` - Inicio de sesión exitoso
- `LOGIN_FAILED` - Intento fallido de inicio de sesión
- `LOGOUT` - Cierre de sesión
- `PASSWORD_CHANGED` - Cambio de contraseña desde login

### 1.2 UsersController - Perfil
- [ ] Registrar cambio de foto de perfil
- [ ] Registrar cambio de nombre
- [ ] Registrar cambio de contraseña
- [ ] Registrar cambio de email
- [ ] Registrar cambio de teléfono

**Acciones:**
- `PROFILE_PHOTO_UPDATED` - Cambio de foto de perfil
- `PROFILE_NAME_UPDATED` - Cambio de nombre
- `PROFILE_PASSWORD_UPDATED` - Cambio de contraseña
- `PROFILE_EMAIL_UPDATED` - Cambio de email
- `PROFILE_PHONE_UPDATED` - Cambio de teléfono
- `PROFILE_UPDATED` - Actualización general de perfil

### 1.3 MaquinasController - Máquinas
- [x] Registrar cambios de estado (ya implementado parcialmente)
- [ ] Mejorar registro para incluir tiempo transcurrido PREPARANDO → LISTO
- [ ] Registrar carga de programación desde Excel
- [ ] Registrar impresión de FF459
- [ ] Registrar suspensiones con motivo

**Acciones:**
- `MACHINE_STATUS_CHANGED` - Cambio de estado de máquina
- `MACHINE_PROGRAMMING_LOADED` - Carga de programación desde Excel
- `MACHINE_FF459_PRINTED` - Impresión de formato FF459
- `MACHINE_PROGRAM_SUSPENDED` - Suspensión de programa
- `MACHINE_PROGRAM_RESUMED` - Reanudación de programa

### 1.4 DesignsController - Diseños
- [ ] Registrar creación de diseño
- [ ] Registrar modificación de diseño
- [ ] Registrar eliminación de diseño
- [ ] Registrar duplicación de diseño
- [ ] Registrar consulta de diseño

**Acciones:**
- `DESIGN_CREATED` - Creación de diseño
- `DESIGN_UPDATED` - Modificación de diseño
- `DESIGN_DELETED` - Eliminación de diseño
- `DESIGN_DUPLICATED` - Duplicación de diseño
- `DESIGN_VIEWED` - Consulta de diseño

### 1.5 ReportsController - Reportes
- [ ] Registrar consulta de reportes
- [ ] Registrar exportación de reportes
- [ ] Registrar filtros aplicados

**Acciones:**
- `REPORT_VIEWED` - Consulta de reporte
- `REPORT_EXPORTED` - Exportación de reporte

### 1.6 SystemConfigController - Configuraciones
- [ ] Registrar creación de usuario
- [ ] Registrar modificación de usuario
- [ ] Registrar eliminación de usuario
- [ ] Registrar cambio de permisos
- [ ] Registrar cambios de configuración del sistema

**Acciones:**
- `USER_CREATED` - Creación de usuario
- `USER_UPDATED` - Modificación de usuario
- `USER_DELETED` - Eliminación de usuario
- `USER_PERMISSIONS_CHANGED` - Cambio de permisos
- `SYSTEM_CONFIG_UPDATED` - Actualización de configuración del sistema

## Fase 2: Backend - API de Consulta de Actividades

### 2.1 Crear ActivityController
- [ ] Endpoint GET /api/activities - Listar actividades con filtros
- [ ] Endpoint GET /api/activities/{id} - Obtener actividad específica
- [ ] Endpoint GET /api/activities/export - Exportar actividades a Excel
- [ ] Endpoint GET /api/activities/stats - Estadísticas de actividades

### 2.2 Filtros a Implementar
- [ ] Por módulo (AUTH, PROFILE, MACHINES, DESIGNS, REPORTS, CONFIG)
- [ ] Por usuario (userId o userCode)
- [ ] Por rango de fechas (startDate, endDate)
- [ ] Por tipo de acción
- [ ] Por máquina (para módulo MACHINES)
- [ ] Por artículo (para módulos MACHINES y DESIGNS)

### 2.3 DTOs
```csharp
public class ActivityFilterDto
{
    public string? Module { get; set; }
    public int? UserId { get; set; }
    public string? UserCode { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Action { get; set; }
    public int? MachineNumber { get; set; }
    public string? Articulo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class ActivityDto
{
    public int Id { get; set; }
    public string Action { get; set; }
    public string Description { get; set; }
    public DateTime Timestamp { get; set; }
    public string Module { get; set; }
    public string? Details { get; set; }
    public int UserId { get; set; }
    public string? UserCode { get; set; }
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
}

public class ActivityStatsDto
{
    public int TotalActivities { get; set; }
    public Dictionary<string, int> ActivitiesByModule { get; set; }
    public Dictionary<string, int> ActivitiesByAction { get; set; }
    public Dictionary<string, int> ActivitiesByUser { get; set; }
    public List<ActivityDto> RecentActivities { get; set; }
}
```

## Fase 3: Frontend - Componente de Reportes

### 3.1 Crear Componente de Reportes de Actividades
- [ ] Ruta: `/reports` o `/activities`
- [ ] Tabla con paginación
- [ ] Filtros interactivos
- [ ] Búsqueda en tiempo real
- [ ] Exportación a Excel

### 3.2 Características de la UI
- [ ] Filtro por módulo (dropdown)
- [ ] Filtro por usuario (autocomplete)
- [ ] Filtro por rango de fechas (date picker)
- [ ] Filtro por tipo de acción (dropdown)
- [ ] Búsqueda por texto libre
- [ ] Tabla con columnas: Fecha/Hora, Usuario, Módulo, Acción, Descripción, Detalles
- [ ] Expandir detalles (JSON formateado)
- [ ] Botón de exportar a Excel
- [ ] Indicadores visuales por módulo (colores)

### 3.3 Servicio Frontend
```typescript
export class ActivityService {
  getActivities(filters: ActivityFilter): Observable<ActivityResponse>
  exportActivities(filters: ActivityFilter): Observable<Blob>
  getActivityStats(): Observable<ActivityStats>
}
```

## Fase 4: Mejoras y Optimización

### 4.1 Base de Datos
- [ ] Crear índices en Activities:
  - `idx_activities_module` (Module)
  - `idx_activities_user` (UserId)
  - `idx_activities_timestamp` (Timestamp)
  - `idx_activities_action` (Action)

### 4.2 Retención de Datos
- [ ] Implementar política de retención (30 días por defecto)
- [ ] Job programado para limpiar actividades antiguas
- [ ] Opción de archivar actividades importantes

### 4.3 Notificaciones (Opcional)
- [ ] Alertas para actividades críticas
- [ ] Notificaciones en tiempo real (SignalR)

## Orden de Implementación Recomendado

1. **Día 1**: AuthController logging (LOGIN/LOGOUT)
2. **Día 2**: UsersController logging (PROFILE)
3. **Día 3**: MaquinasController logging mejorado (MACHINES)
4. **Día 4**: DesignsController logging (DESIGNS)
5. **Día 5**: ActivityController + API endpoints
6. **Día 6**: Frontend - Componente de reportes
7. **Día 7**: Exportación a Excel + Optimizaciones

## Notas Importantes

- Usar `try-catch` en todos los logs para no afectar funcionalidad principal
- No registrar información sensible (contraseñas, tokens)
- Formatear Details como JSON válido
- Considerar performance en consultas con muchos registros
- Implementar paginación en todas las consultas

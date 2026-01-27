# Sistema de Reportes de Actividades - FlexoAPP

## Objetivo
Implementar un sistema completo de auditoría y reportes que registre todas las acciones de los usuarios en el sistema, incluyendo autenticación, cambios de perfil, operaciones en máquinas, diseños, reportes y configuraciones.

## Módulos a Auditar

### 1. LOGIN/AUTENTICACIÓN
**Eventos a registrar:**
- ✅ Inicio de sesión exitoso
- ✅ Cierre de sesión
- ✅ Intento de inicio de sesión fallido
- ✅ Cambio de contraseña desde login

**Información a capturar:**
- Usuario (código y nombre)
- Fecha y hora exacta
- Dirección IP
- Resultado (éxito/fallo)

### 2. PERFIL DE USUARIO
**Eventos a registrar:**
- ✅ Cambio de foto de perfil
- ✅ Cambio de nombre (FirstName/LastName)
- ✅ Cambio de contraseña
- ✅ Cambio de email
- ✅ Cambio de teléfono
- ✅ Actualización de información personal

**Información a capturar:**
- Usuario que realiza el cambio
- Fecha y hora exacta
- Tipo de cambio realizado
- Valor anterior y nuevo (excepto contraseñas)

### 3. MÁQUINAS
**Eventos a registrar:**
- ✅ Cambio de estado (PREPARANDO → LISTO → CORRIENDO → TERMINADO → SUSPENDIDO)
- ✅ Tiempo transcurrido entre PREPARANDO y LISTO
- ✅ Suspensión de programa (con motivo)
- ✅ Reanudación de programa suspendido
- ✅ Carga de programación desde Excel
- ✅ Impresión de FF459

**Información a capturar:**
- Artículo
- Descripción (Cliente)
- Número de máquina
- Acción realizada
- Estado anterior → Estado nuevo
- **Tiempo transcurrido** (para PREPARANDO → LISTO)
- Fecha y hora del evento
- Usuario que realizó la acción
- Observaciones (para suspensiones)

### 4. DISEÑOS
**Eventos a registrar:**
- ✅ Creación de diseño
- ✅ Modificación de diseño
- ✅ Eliminación de diseño
- ✅ Duplicación de diseño
- ✅ Consulta de diseño

**Información a capturar:**
- Artículo del diseño
- Descripción
- Acción realizada (CREATE/UPDATE/DELETE/DUPLICATE/VIEW)
- Fecha y hora del evento
- Usuario que realizó la acción
- Cambios específicos (para modificaciones)

### 5. REPORTES
**Eventos a registrar:**
- ✅ Consulta de reporte
- ✅ Exportación de reporte
- ✅ Filtros aplicados

**Información a capturar:**
- Tipo de reporte consultado
- Código/filtros utilizados
- Fecha y hora de la consulta
- Usuario que consultó
- Formato de exportación (si aplica)

### 6. CONFIGURACIONES
**Eventos a registrar:**
- ✅ Creación de usuario
- ✅ Modificación de usuario
- ✅ Eliminación de usuario
- ✅ Cambio de permisos
- ✅ Cambio de configuraciones del sistema
- ✅ Cambio de ajustes generales

**Información a capturar:**
- Tipo de configuración modificada
- Usuario afectado (si aplica)
- Cambio realizado
- Fecha y hora del evento
- Usuario administrador que realizó el cambio

## Estructura de Datos

### Tabla Activities (Existente)
```sql
CREATE TABLE Activities (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Action VARCHAR(200) NOT NULL,           -- Tipo de acción (LOGIN, LOGOUT, CHANGE_PASSWORD, etc.)
    Description VARCHAR(500) NOT NULL,      -- Descripción legible de la acción
    Timestamp DATETIME NOT NULL,            -- Fecha y hora del evento
    Module VARCHAR(100) NOT NULL,           -- Módulo (AUTH, PROFILE, MACHINES, DESIGNS, REPORTS, CONFIG)
    Details TEXT,                           -- JSON con información adicional específica del evento
    UserId INT NOT NULL,                    -- ID del usuario que realizó la acción
    UserCode VARCHAR(50),                   -- Código del usuario
    IpAddress VARCHAR(45),                  -- Dirección IP del usuario
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

### Formato del campo Details (JSON)
```json
{
  // Para LOGIN/LOGOUT
  "success": true,
  "failureReason": "Invalid password",
  
  // Para PROFILE
  "fieldChanged": "FirstName",
  "oldValue": "Juan",
  "newValue": "Juan Carlos",
  
  // Para MACHINES
  "articulo": "F204567",
  "cliente": "ABSORBENTES DE COLOMBIA S.A",
  "numeroMaquina": 11,
  "estadoAnterior": "PREPARANDO",
  "estadoNuevo": "LISTO",
  "tiempoTranscurrido": "5 minutos y 30 segundos",
  "observaciones": "Falta de material",
  
  // Para DESIGNS
  "articulo": "F204567",
  "descripcion": "Diseño para cliente ABC",
  "changeType": "UPDATE",
  "fieldsChanged": ["colores", "sustrato"],
  
  // Para REPORTS
  "reportType": "MACHINE_ACTIVITY",
  "filters": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "machineNumber": 11
  },
  "exportFormat": "EXCEL",
  
  // Para CONFIG
  "configType": "USER_CREATION",
  "affectedUser": "operario1",
  "changes": {
    "role": "OPERATOR",
    "permissions": ["VIEW_MACHINES", "UPDATE_STATUS"]
  }
}
```

## Implementación

### Backend
1. ✅ Servicio de auditoría (ActivityLoggerService) - Ya existe
2. ✅ Integrar logging en todos los controladores
3. ✅ Endpoint para consultar actividades con filtros
4. ✅ Endpoint para exportar reportes de actividades

### Frontend
1. ✅ Componente de reportes de actividades
2. ✅ Filtros por módulo, usuario, fecha
3. ✅ Visualización en tabla con paginación
4. ✅ Exportación a Excel
5. ✅ Gráficos de actividad (opcional)

## Prioridades
1. **Alta**: LOGIN, PROFILE, MACHINES
2. **Media**: DESIGNS, CONFIG
3. **Baja**: REPORTS (meta-reporting)

## Notas Técnicas
- Usar el servicio ActivityLoggerService existente
- Implementar middleware para capturar IP automáticamente
- Considerar retención de datos (30 días por defecto)
- Implementar índices en la tabla Activities para consultas rápidas

# � Doocumentación Técnica - Módulo de Máquinas

## 🏗️ Arquitectura del Sistema

### Componentes Principales

#### 1. **MachinesComponent** (`machines.ts`)
- **Responsabilidad**: Controlador principal del módulo
- **Funcionalidades**:
  - Gestión de estado de máquinas y programas
  - Control de permisos de usuario
  - Procesamiento de archivos Excel
  - Generación de formato FF459
  - Sincronización en tiempo real

#### 2. **PermissionsService** (`permissions.service.ts`)
- **Responsabilidad**: Gestión de permisos y roles
- **Funcionalidades**:
  - Control de acceso granular
  - Roles predefinidos
  - Validación de permisos por funcionalidad

#### 3. **MachineProgramsService** (`machine-programs.service.ts`)
- **Responsabilidad**: CRUD de programas de máquinas
- **Funcionalidades**:
  - Creación, lectura, actualización y eliminación de programas
  - Cambio de estados
  - Filtrado por máquina

## 🔐 Sistema de Permisos

### Interfaz MachinePermissions
```typescript
interface MachinePermissions {
  canLoadExcel: boolean;          // Cargar archivos Excel
  canDownloadTemplate: boolean;   // Descargar plantilla
  canViewFF459: boolean;          // Ver formato FF459
  canChangeStatus: boolean;       // Cambiar estados
  canSuspendPrograms: boolean;    // Suspender programas
  canDeletePrograms: boolean;     // Eliminar programas
  canClearPrograms: boolean;      // Limpiar toda la programación
}
```

### Roles y Permisos
| Rol | Excel | Plantilla | FF459 | Estados | Suspender | Eliminar | Limpiar |
|-----|-------|-----------|-------|---------|-----------|----------|---------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Supervisor | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Operador | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Visualizador | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Implementación en Template
```html
<!-- Botón con control de permisos -->
<button mat-raised-button 
        (click)="fileInput.click()" 
        [disabled]="loading() || !userPermissions().canLoadExcel"
        *ngIf="userPermissions().canLoadExcel">
  <mat-icon>upload_file</mat-icon>
  Cargar Programación Excel
</button>
```

## 📊 Procesamiento de Excel

### Formato Esperado
| Columna | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| A | MQ | number | Número de máquina (11-21) |
| B | ARTICULO | string | Código del artículo |
| C | F OT SAP | string | Orden de trabajo SAP |
| D | CLIENTE | string | Nombre del cliente |
| E | REFERENCIA | string | Referencia del producto |
| F | TD | string | Código TD (máx 3 chars) |
| G | N° COLORES | number | Cantidad de colores |
| H | KILOS | number | Peso en kilogramos |
| I | SUSTRATOS | string | Tipo de sustrato |
| J-S | Color1-10 | string | Nombres de colores |

### Validaciones
- **Máquina**: Debe estar entre 11-21
- **Campos obligatorios**: ARTICULO, F OT SAP, CLIENTE
- **Kilos**: Debe ser mayor a 0
- **TD**: Máximo 3 caracteres, convertido a mayúsculas
- **Colores**: Filtrado de valores vacíos o nulos

### Manejo de Errores
- **Duplicados**: Intenta actualizar programa existente
- **Formato inválido**: Muestra errores específicos por fila
- **Conexión**: Manejo de errores de backend
- **Autenticación**: Validación de sesión activa

## 🎨 Sistema de Estados Visuales

### LED Indicador
- **Forma**: Medialuna (8px x 24px)
- **Posición**: Lado izquierdo del botón
- **Estados**:
  - 🔴 **Crítico (0-3 pedidos)**: Parpadeo cada 1s
  - 🟠 **Advertencia (4-7 pedidos)**: Parpadeo cada 1.5s
  - 🟢 **Óptimo (8+ pedidos)**: Parpadeo cada 2s

### Animaciones CSS
```scss
@keyframes ledBlinkRed {
  0%, 100% { opacity: 1; background: #dc2626; }
  50% { opacity: 0; background: rgba(220, 38, 38, 0.1); }
}
```

## 🔄 Sincronización en Tiempo Real

### SimpleSyncService
- **Eventos**: Cambios de estado, actualizaciones de programas
- **Alcance**: Múltiples pestañas/dispositivos
- **Implementación**: RxJS Subjects y localStorage

### Flujo de Sincronización
1. Usuario cambia estado de programa
2. Se actualiza en backend
3. Se emite evento de sincronización
4. Otras instancias reciben el evento
5. Se actualiza la vista automáticamente

## 📱 Diseño Responsive

### Breakpoints
- **Desktop (>1200px)**: Layout dos columnas completo
- **Tablet (768px-1200px)**: Ajustes de espaciado
- **Mobile (<768px)**: Layout vertical, grid de máquinas

### Adaptaciones Móviles
- Header colapsable
- Grid de máquinas en lugar de lista vertical
- Tabla con scroll horizontal
- Botones de acción más grandes

## 🧪 Testing y Debugging

### Logs del Sistema
```typescript
console.log('🚀 Inicializando componente de máquinas...');
console.log('🔧 machineNumbers:', this.machineNumbers);
console.log('🔐 Estado de autenticación:', { isLoggedIn, hasToken: !!token });
console.log('🔒 Permisos del usuario:', permissions);
```

### Validaciones de Desarrollo
- Verificación de token de autenticación
- Validación de conectividad con backend
- Manejo de errores de red
- Logs detallados de procesamiento Excel

## 🔧 Configuración y Mantenimiento

### Variables de Entorno
- Backend URL para APIs
- Configuración de timeouts
- Límites de archivo Excel (10MB)

### Monitoreo
- Estados de conexión
- Estadísticas de sincronización
- Métricas de rendimiento
- Logs de errores

## 📈 Métricas y Analytics

### KPIs Monitoreados
- Tiempo de procesamiento de Excel
- Tasa de éxito de importación
- Frecuencia de cambios de estado
- Uso de funcionalidades por rol

### Optimizaciones
- Lazy loading de componentes
- Paginación de datos grandes
- Cache de permisos
- Debounce en búsquedas

## 🚀 Roadmap Técnico

### Próximas Mejoras
- [ ] WebSocket para sincronización real-time
- [ ] Compresión de archivos Excel grandes
- [ ] Cache inteligente de programas
- [ ] Métricas avanzadas de rendimiento
- [ ] Tests unitarios y e2e
- [ ] Documentación API completa
# Pages Module

## 📋 Descripción
Módulo que contiene todas las páginas principales de la aplicación FlexoAPP, organizadas como componentes standalone con lazy loading.

## 🏗️ Estructura
```
pages/
├── dashboard/         # Panel principal con métricas
├── design/           # Diseño de productos flexográficos
├── documento/        # Gestión de documentos
├── header/           # Componente de navegación
├── informacion/      # Información del sistema
├── machines/         # Gestión de máquinas
├── profile/          # Perfil de usuario
├── reports/          # Reportes y análisis
├── settings/         # Configuraciones
└── README.md         # Esta documentación
```

## 📊 Dashboard
- **Propósito**: Panel principal con métricas y KPIs
- **Tecnologías**: Chart.js, RxJS, Angular Material
- **Funcionalidades**:
  - Gráficos en tiempo real
  - Métricas de producción
  - Alertas y notificaciones
  - Widgets configurables

## 🎨 Design
- **Propósito**: Diseño de productos flexográficos
- **Tecnologías**: Canvas API, SVG, TypeScript
- **Funcionalidades**:
  - Editor visual
  - Plantillas predefinidas
  - Exportación de diseños
  - Vista previa en tiempo real

## 📄 Documento
- **Propósito**: Gestión de documentos del sistema
- **Tecnologías**: File API, PDF.js, XLSX
- **Funcionalidades**:
  - Upload de archivos
  - Visualización de documentos
  - Exportación a múltiples formatos
  - Control de versiones

## 🧭 Header
- **Propósito**: Navegación principal de la aplicación
- **Tecnologías**: Angular Router, RxJS
- **Funcionalidades**:
  - Menú responsive
  - Breadcrumbs
  - Notificaciones
  - Perfil de usuario

## ℹ️ Información
- **Propósito**: Información del sistema y ayuda
- **Tecnologías**: Angular, Markdown
- **Funcionalidades**:
  - Documentación integrada
  - FAQ
  - Versión del sistema
  - Contacto y soporte

## 🏭 Machines
- **Propósito**: Gestión y monitoreo de máquinas
- **Tecnologías**: Socket.IO, Chart.js, RxJS
- **Funcionalidades**:
  - Estado en tiempo real
  - Configuración de máquinas
  - Historial de operaciones
  - Mantenimiento predictivo

## 👤 Profile
- **Propósito**: Gestión del perfil de usuario
- **Tecnologías**: Angular Forms, File API
- **Funcionalidades**:
  - Edición de datos personales
  - Cambio de contraseña
  - Configuración de preferencias
  - Avatar personalizado

## 📈 Reports
- **Propósito**: Generación y visualización de reportes
- **Tecnologías**: Chart.js, XLSX, PDF.js
- **Funcionalidades**:
  - Reportes dinámicos
  - Exportación múltiple
  - Filtros avanzados
  - Programación de reportes

## ⚙️ Settings
- **Propósito**: Configuraciones del sistema
- **Tecnologías**: Angular Forms, Local Storage
- **Funcionalidades**:
  - Configuración de usuario
  - Parámetros del sistema
  - Temas y personalización
  - Backup y restauración

## 🎯 Características Comunes

### Lazy Loading
- Cada página se carga bajo demanda
- Optimización de bundle size
- Mejor performance inicial

### Responsive Design
- Adaptable a todos los dispositivos
- Mobile-first approach
- Breakpoints optimizados

### Error Handling
- Manejo robusto de errores
- Fallback components
- User-friendly messages

### Performance
- **TrackBy** en listas
- **OnPush** change detection
- **Virtual scrolling** en listas grandes
- **Image lazy loading**

## 📡 Comunicación

### Services
- Inyección de servicios core
- Estado compartido via RxJS
- Comunicación entre componentes

### Socket.IO
- Actualizaciones en tiempo real
- Notificaciones push
- Sincronización de datos

### HTTP Client
- Peticiones REST
- Interceptors automáticos
- Caché inteligente

## 🔄 Routing
```typescript
const routes: Routes = [
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component') },
  { path: 'machines', loadComponent: () => import('./machines/machines.component') },
  { path: 'design', loadComponent: () => import('./design/design.component') },
  { path: 'reports', loadComponent: () => import('./reports/reports.component') },
  // ... más rutas
];
```

## 📋 Dependencias Principales
- `@angular/core` - Framework base
- `@angular/common` - Directivas comunes
- `@angular/router` - Navegación
- `@angular/forms` - Formularios
- `rxjs` - Programación reactiva
- `chart.js` - Gráficos
- `socket.io-client` - WebSockets

## 🛠️ Optimizaciones
- **Standalone components** para mejor tree-shaking
- **Lazy loading** de rutas
- **OnPush** change detection strategy
- **TrackBy functions** en *ngFor
- **Async pipes** para subscripciones automáticas
- **Virtual scrolling** para listas grandes
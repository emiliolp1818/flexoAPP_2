# Shared Module

## 📋 Descripción
Módulo compartido que contiene componentes, servicios, interfaces y utilidades reutilizables en toda la aplicación.

## 🏗️ Estructura
```
shared/
├── components/       # Componentes reutilizables
├── dialogs/         # Diálogos y modales
├── interfaces/      # Interfaces TypeScript
├── services/        # Servicios compartidos
└── README.md        # Esta documentación
```

## 🧩 Components

### Componentes UI Reutilizables
- **LoadingSpinner**: Indicador de carga
- **ConfirmDialog**: Diálogo de confirmación
- **DataTable**: Tabla de datos con paginación
- **SearchBox**: Caja de búsqueda con filtros
- **FileUpload**: Componente de subida de archivos
- **DatePicker**: Selector de fechas personalizado
- **Chart**: Wrapper para Chart.js
- **Breadcrumb**: Navegación de migas de pan

### Características de Componentes
- **Standalone**: Componentes independientes
- **OnPush**: Change detection optimizada
- **Input/Output**: Comunicación clara
- **Accessibility**: Cumplimiento WCAG
- **Responsive**: Adaptables a dispositivos

## 🗨️ Dialogs

### Modal Components
- **ConfirmationDialog**: Confirmación de acciones
- **AlertDialog**: Alertas informativas
- **FormDialog**: Formularios en modal
- **ImagePreviewDialog**: Vista previa de imágenes
- **SettingsDialog**: Configuraciones rápidas

### Dialog Service
- Gestión centralizada de modales
- Configuración dinámica
- Resultado de diálogos
- Stack de modales

## 🔧 Interfaces

### Data Models
```typescript
// Usuario
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Máquina
interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  lastMaintenance: Date;
}

// Producto
interface Product {
  id: string;
  name: string;
  design: Design;
  specifications: ProductSpec[];
}

// Reporte
interface Report {
  id: string;
  title: string;
  type: ReportType;
  data: any[];
  createdAt: Date;
}
```

### API Responses
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}
```

### Form Models
```typescript
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface MachineForm {
  name: string;
  type: MachineType;
  location: string;
  specifications: MachineSpec[];
}
```

## 🔧 Services

### UtilityService
- **Propósito**: Funciones de utilidad comunes
- **Funcionalidades**:
  - Formateo de fechas
  - Validaciones
  - Conversiones de datos
  - Helpers matemáticos

### StorageService
- **Propósito**: Gestión de almacenamiento local
- **Funcionalidades**:
  - LocalStorage wrapper
  - SessionStorage wrapper
  - Serialización automática
  - Expiración de datos

### ValidationService
- **Propósito**: Validaciones personalizadas
- **Funcionalidades**:
  - Validators de formularios
  - Validación de archivos
  - Reglas de negocio
  - Mensajes de error

### ExportService
- **Propósito**: Exportación de datos
- **Funcionalidades**:
  - Exportar a Excel
  - Exportar a PDF
  - Exportar a CSV
  - Configuración personalizada

## 🎨 Pipes Personalizados

### FormatPipes
```typescript
// Formateo de fechas
{{ date | customDate:'dd/MM/yyyy' }}

// Formateo de números
{{ number | customNumber:'1.2-2' }}

// Formateo de moneda
{{ amount | customCurrency:'USD' }}

// Truncar texto
{{ text | truncate:50 }}
```

### FilterPipes
```typescript
// Filtrar arrays
{{ items | filterBy:'name':searchTerm }}

// Ordenar arrays
{{ items | orderBy:'date':'desc' }}

// Agrupar elementos
{{ items | groupBy:'category' }}
```

## 🎯 Directivas

### CustomDirectives
- **ClickOutside**: Detectar clicks fuera del elemento
- **LazyLoad**: Carga diferida de imágenes
- **Tooltip**: Tooltips personalizados
- **Highlight**: Resaltado de texto
- **AutoFocus**: Foco automático en elementos

## 📊 Constants

### AppConstants
```typescript
export const APP_CONSTANTS = {
  API_VERSION: 'v1',
  PAGE_SIZE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['jpg', 'png', 'pdf'],
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};
```

### ValidationPatterns
```typescript
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};
```

## 🔄 Observables y RxJS

### Operators Personalizados
```typescript
// Retry con backoff exponencial
export const retryWithBackoff = (maxRetries: number) => 
  retryWhen(errors => 
    errors.pipe(
      scan((acc, error) => ({ count: acc.count + 1, error }), { count: 0, error: null }),
      tap(({ count, error }) => {
        if (count > maxRetries) throw error;
      }),
      delay(1000 * Math.pow(2, acc.count))
    )
  );

// Cache con TTL
export const cacheWithTTL = <T>(ttl: number) =>
  shareReplay({ bufferSize: 1, refCount: true });
```

## 🛠️ Optimizaciones

### Performance
- **OnPush** change detection en todos los componentes
- **TrackBy** functions para listas
- **Virtual scrolling** para grandes datasets
- **Lazy loading** de imágenes
- **Debounce** en búsquedas

### Memory Management
- **Unsubscribe** automático con takeUntil
- **WeakMap** para referencias débiles
- **Object pooling** para objetos reutilizables
- **Cleanup** en OnDestroy

### Bundle Optimization
- **Tree-shaking** friendly
- **Standalone components**
- **Dynamic imports**
- **Code splitting**

## 📋 Dependencias
- `@angular/core` - Framework base
- `@angular/common` - Directivas y pipes
- `@angular/forms` - Validaciones
- `rxjs` - Programación reactiva
- `date-fns` - Manipulación de fechas
- `lodash-es` - Utilidades (tree-shakeable)

## 🔧 Testing
- **Unit tests** para todos los servicios
- **Component tests** para componentes UI
- **Integration tests** para pipes y directivas
- **Mock services** para testing
- **Test utilities** compartidas
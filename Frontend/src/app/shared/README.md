# 🔄 Componentes Compartidos (Shared)

Documentación de componentes, servicios y utilidades compartidas en FlexoAPP Frontend.

---

## 📂 Estructura

```
src/app/shared/
├── components/         # Componentes reutilizables
├── pipes/             # Pipes personalizados
└── services/          # Servicios compartidos
```

---

## 🧩 Componentes (`/components`)

### 1. Dashboard
**Ubicación:** `shared/components/dashboard/`

**Propósito:**
Panel principal de control con estadísticas y métricas del sistema.

**Características:**
- Estadísticas en tiempo real
- Gráficos interactivos (Chart.js)
- Resumen de actividades
- Indicadores clave (KPIs)

**Archivos:**
- `dashboard.ts` - Lógica del componente
- `dashboard.html` - Template
- `dashboard.scss` - Estilos

---

### 2. Diseño
**Ubicación:** `shared/components/diseño/`

**Propósito:**
Gestión completa de diseños flexográficos.

**Características:**
- Lista de diseños con filtros
- Crear nuevos diseños
- Editar diseños existentes
- Visualización de detalles
- Exportación de datos

**Archivos:**
- Componente principal
- Sub-componentes de formularios
- Servicios de diseño

---

### 3. Documento
**Ubicación:** `shared/components/documento/`

**Propósito:**
Gestión de documentos del sistema.

**Características:**
- Lista de documentos
- Subida de archivos
- Descarga de documentos
- Conversión a PDF
- Previsualización
- Organización por categorías

**Archivos:**
- Componente principal
- Diálogos de subida/edición
- Servicio de documentos

---

### 4. Máquinas (Machines)
**Ubicación:** `shared/components/machines/`

**Propósito:**
Gestión y monitoreo de máquinas flexográficas.

**Características:**
- Lista de máquinas
- Estado en tiempo real
- Programación de trabajos
- Historial de actividades
- Mantenimiento

**Archivos:**
- `machines.ts` - Lógica
- `machines.html` - Template
- `machines.scss` - Estilos

---

### 5. Reports (Reportes)
**Ubicación:** `shared/components/reports/`

**Propósito:**
Generación y visualización de reportes del sistema.

**Características:**
- Reportes de máquinas
- Reportes de producción
- Reportes de pedidos
- Filtros personalizados
- Exportación a Excel/PDF
- Gráficos estadísticos

**Archivos:**
- `reports.ts` - Lógica
- `reports.html` - Template
- `reports.scss` - Estilos
- `README.md` - Documentación específica

---

### 6. Condición Única
**Ubicación:** `shared/components/condicion-unica/`

**Propósito:**
Gestión de condiciones únicas del sistema.

**Características:**
- Lista de condiciones
- Crear condiciones
- Editar condiciones
- Validación de datos
- Búsqueda y filtros

**Archivos:**
- Componente principal
- Formularios
- Servicio de condiciones

---

### 7. Header
**Ubicación:** `shared/components/header/`

**Propósito:**
Barra de navegación superior de la aplicación.

**Características:**
- Menú de navegación
- Perfil de usuario
- Notificaciones
- Cambio de idioma
- Cambio de tema (claro/oscuro)
- Logout

**Archivos:**
- `header.ts` - Lógica
- `header.html` - Template
- `header.scss` - Estilos

**Servicios utilizados:**
- AuthService
- LanguageService
- ThemeService
- NotificationService

---

### 8. Información
**Ubicación:** `shared/components/informacion/`

**Propósito:**
Información del sistema y ayuda.

**Características:**
- Acerca de la aplicación
- Versión del sistema
- Ayuda y documentación
- Contacto

**Archivos:**
- Componente principal
- Templates de información

---

### 9. Print FF459
**Ubicación:** `shared/components/print-ff459/`

**Propósito:**
Impresión de formato FF459 (formato específico de la industria).

**Características:**
- Vista previa del formato
- Generación de PDF
- Impresión directa
- Personalización de datos

**Archivos:**
- Componente de impresión
- Template HTML del formato
- Servicio de generación PDF

---

## 🔧 Pipes (`/pipes`)

### TranslatePipe
**Ubicación:** `shared/pipes/translate.pipe.ts`

**Propósito:**
Pipe personalizado para traducción de textos.

**Uso:**
```html
{{ 'key.translation' | translate }}
{{ 'key.with.params' | translate:{ param: value } }}
```

**Características:**
- Traducción dinámica
- Soporte de parámetros
- Fallback a clave si no existe traducción
- Integración con ngx-translate

---

## 🛠️ Servicios (`/services`)

### 1. CondicionUnicaService
**Ubicación:** `shared/services/condicion-unica.service.ts`

**Propósito:**
Gestión de condiciones únicas del sistema.

**Métodos principales:**
```typescript
getAll(): Observable<CondicionUnica[]>
getById(id: number): Observable<CondicionUnica>
create(data: CondicionUnica): Observable<CondicionUnica>
update(id: number, data: CondicionUnica): Observable<CondicionUnica>
delete(id: number): Observable<void>
search(query: string): Observable<CondicionUnica[]>
```

**Características:**
- CRUD completo
- Validación de datos
- Búsqueda y filtros
- Caché de datos
- Manejo de errores

---

### 2. DocumentoService
**Ubicación:** `shared/services/documento.service.ts`

**Propósito:**
Gestión de documentos y archivos.

**Métodos principales:**
```typescript
getAll(): Observable<Documento[]>
getById(id: number): Observable<Documento>
upload(file: File, metadata: any): Observable<Documento>
download(id: number): Observable<Blob>
convertToPdf(id: number): Observable<Blob>
delete(id: number): Observable<void>
```

**Características:**
- Subida de archivos
- Descarga de documentos
- Conversión a PDF
- Gestión de metadatos
- Progress tracking

---

### 3. TimeFormatService
**Ubicación:** `shared/services/time-format.service.ts`

**Propósito:**
Formateo y conversión de fechas y horas.

**Métodos principales:**
```typescript
format(date: Date, format: string): string
toLocalTime(utcDate: Date): Date
toUTCTime(localDate: Date): Date
getRelativeTime(date: Date): string
```

**Características:**
- Formateo personalizado
- Conversión de zonas horarias
- Tiempo relativo (hace 2 horas, etc.)
- Localización

---

## 🎨 Estilos Compartidos

### Variables de Tema
Los componentes compartidos utilizan variables CSS definidas en:
- `src/styles/themes.scss`

### Clases Utilitarias
- `.flex-container` - Contenedor flex
- `.grid-container` - Contenedor grid
- `.card` - Tarjeta de Material
- `.button-primary` - Botón primario
- `.button-secondary` - Botón secundario

---

## 🔄 Comunicación entre Componentes

### Input/Output
```typescript
@Input() data: any;
@Output() dataChange = new EventEmitter<any>();
```

### Servicios Compartidos
```typescript
constructor(private sharedService: SharedService) {}
```

### NgRx Store
```typescript
this.store.select(selectData).subscribe(data => {
  // Usar datos del store
});
```

---

## 📊 Uso de Componentes Compartidos

### Importación
```typescript
import { DashboardComponent } from '@shared/components/dashboard/dashboard';
import { HeaderComponent } from '@shared/components/header/header';
```

### Uso en Templates
```html
<app-header></app-header>
<app-dashboard></app-dashboard>
```

---

## 🧪 Testing

### Unit Tests
Cada componente debe tener sus tests:
```typescript
describe('DashboardComponent', () => {
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## 📝 Convenciones

### Naming
- **Componentes:** `ComponentNameComponent`
- **Servicios:** `ServiceNameService`
- **Pipes:** `PipeNamePipe`

### Estructura de Archivos
```
component-name/
├── component-name.ts
├── component-name.html
├── component-name.scss
└── README.md (opcional)
```

---

## 🚀 Mejores Prácticas

### Componentes
- ✅ Mantener componentes pequeños y enfocados
- ✅ Usar OnPush change detection
- ✅ Unsubscribe de observables
- ✅ Validar inputs
- ✅ Documentar outputs

### Servicios
- ✅ Un servicio, una responsabilidad
- ✅ Usar observables para async
- ✅ Implementar error handling
- ✅ Caché cuando sea apropiado

### Pipes
- ✅ Pure pipes cuando sea posible
- ✅ Transformaciones simples
- ✅ Sin efectos secundarios

---

## 🔗 Dependencias

### Angular Material
Componentes de Material utilizados:
- MatButton
- MatCard
- MatTable
- MatDialog
- MatSnackBar
- MatIcon
- MatMenu

### Chart.js
Para gráficos en:
- Dashboard
- Reports

### Socket.IO
Para actualizaciones en tiempo real en:
- Máquinas
- Dashboard

---

## 📖 Documentación Adicional

Para más información sobre componentes específicos, consultar:
- `shared/components/reports/README.md` - Documentación de reportes
- Documentación inline en cada componente

---

**Última actualización:** 21 de Diciembre de 2025

# Componente de Reportes de Actividades de Usuario

## Descripción General

El componente `ReportsComponent` es un módulo completo para consultar, visualizar y exportar reportes de actividades de usuarios en el sistema FlexoAPP. Proporciona una interfaz moderna e intuitiva para analizar el comportamiento y acciones de los usuarios.

## Archivos del Componente

### 1. reports.ts (TypeScript)
Archivo principal que contiene la lógica del componente.

### 2. reports.html (Template)
Plantilla HTML que define la estructura visual del componente.

### 3. reports.scss (Estilos)
Hoja de estilos SCSS con diseño moderno y responsive.

---

## Estructura del Código TypeScript (reports.ts)

### Imports y Dependencias

```typescript
// Angular Core
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material Components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// ... más imports de Material

// Formularios Reactivos
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Servicios
import { AuthService, User } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
```

### Interfaces de Datos

#### UserAction
Representa una actividad individual del usuario:
- `id`: Identificador único
- `userId`: ID del usuario
- `userCode`: Código del usuario
- `action`: Tipo de acción (LOGIN, CREATE, UPDATE, etc.)
- `description`: Descripción detallada
- `module`: Módulo donde ocurrió (AUTH, MACHINES, DESIGN, etc.)
- `component`: Componente específico
- `timestamp`: Fecha y hora
- `metadata`: Datos adicionales (IP, navegador, etc.)

#### UserReport
Reporte completo de actividades:
- `user`: Información del usuario
- `activities`: Array de actividades
- `totalActivities`: Total de actividades
- `moduleBreakdown`: Desglose por módulo
- `dateRange`: Rango de fechas del reporte

### Configuración del Componente

```typescript
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [/* módulos necesarios */],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
```

### Propiedades del Componente

#### Señales (Signals)
Sistema de reactividad de Angular:

```typescript
loading = signal<boolean>(false);              // Indica si hay búsqueda en progreso
searchResults = signal<UserReport | null>(null); // Resultados de la búsqueda
availableUsers = signal<User[]>([]);           // Lista de usuarios disponibles
```

#### Formularios

```typescript
searchForm: FormGroup;  // Formulario de búsqueda con controles:
                        // - userCode: Código del usuario (requerido)
                        // - startDate: Fecha de inicio (opcional)
                        // - endDate: Fecha de fin (opcional)
                        // - module: Módulo a filtrar (opcional)
```

#### Opciones de Configuración

```typescript
moduleOptions = [
  { value: 'ALL', label: 'Todos los módulos' },
  { value: 'AUTH', label: 'Autenticación' },
  { value: 'PROFILE', label: 'Perfil' },
  { value: 'MACHINES', label: 'Máquinas' },
  { value: 'DESIGN', label: 'Diseño' },
  { value: 'REPORTS', label: 'Reportes' },
  { value: 'SETTINGS', label: 'Configuraciones' }
];
```

### Métodos Principales

#### ngOnInit()
Hook de inicialización que se ejecuta al cargar el componente:
- Carga la lista de usuarios disponibles para el autocompletado

#### loadAvailableUsers()
Carga todos los usuarios del sistema:
- Obtiene el usuario actual del servicio de autenticación
- TODO: Implementar llamada real a la API para obtener todos los usuarios

#### searchUserActivities()
Busca actividades de un usuario específico:
1. Valida el formulario
2. Realiza petición HTTP GET al backend
3. Procesa la respuesta y construye el UserReport
4. Actualiza la señal searchResults
5. Muestra notificación de éxito o error

#### calculateModuleBreakdown()
Calcula el desglose de actividades por módulo:
- Recibe array de actividades
- Cuenta actividades por cada módulo
- Retorna objeto con conteo por módulo

#### exportToPDF()
Exporta el reporte a PDF:
1. Verifica que existan resultados
2. Genera contenido del PDF
3. Crea Blob con el contenido
4. Descarga el archivo automáticamente

#### clearResults()
Limpia resultados y resetea el formulario:
- Limpia searchResults
- Resetea el formulario a valores iniciales
- Limpia el indicador de carga

#### Métodos de Utilidad

- `displayUserCode()`: Función para mostrar el código en el autocomplete
- `selectUser()`: Selecciona un usuario desde chips de sugerencias
- `getDefaultStartDate()`: Retorna fecha de 30 días atrás
- `getDefaultEndDate()`: Retorna fecha actual
- `getRoleDisplayName()`: Convierte código de rol a nombre legible
- `getModuleIcon()`: Retorna icono de Material Design para cada módulo
- `getModuleLabel()`: Retorna etiqueta legible del módulo
- `onDateChange()`: Maneja cambios en los selectores de fecha

---

## Estructura del Template HTML (reports.html)

### 1. Contenedor Principal
```html
<div class="reports-container">
  <!-- Contenedor principal con diseño de página completa -->
</div>
```

### 2. Header Fijo
```html
<div class="reports-header fixed-header">
  <!-- Header que permanece visible al hacer scroll -->
  <!-- Contiene título y subtítulo del módulo -->
</div>
```

### 3. Formulario de Búsqueda
```html
<form [formGroup]="searchForm" class="search-form-modern">
  <!-- Formulario reactivo con validación -->
  
  <!-- Campo: Código de Usuario -->
  <mat-form-field class="field-modern user-field">
    <!-- Input con autocompletado de usuarios -->
  </mat-form-field>
  
  <!-- Campo: Módulo -->
  <mat-form-field class="field-modern module-field">
    <!-- Select con opciones de módulos -->
  </mat-form-field>
  
  <!-- Campos: Rango de Fechas -->
  <div class="date-range-wrapper">
    <!-- Fecha de inicio -->
    <mat-form-field class="field-modern date-field">
      <!-- Datepicker con formato dd/mm/aaaa -->
    </mat-form-field>
    
    <!-- Separador visual -->
    <span class="date-separator">—</span>
    
    <!-- Fecha de fin -->
    <mat-form-field class="field-modern date-field">
      <!-- Datepicker con formato dd/mm/aaaa -->
    </mat-form-field>
  </div>
  
  <!-- Botones de Acción -->
  <div class="search-actions">
    <!-- Botón Buscar -->
    <button mat-raised-button color="primary" (click)="searchUserActivities()">
      <!-- Muestra spinner durante la búsqueda -->
    </button>
    
    <!-- Botón Limpiar -->
    <button mat-stroked-button (click)="clearResults()">
      <!-- Limpia resultados y resetea formulario -->
    </button>
  </div>
</form>
```

### 4. Sección de Resultados

#### 4.1 Header del Reporte
```html
<div class="report-header">
  <!-- Título del reporte con contador de actividades -->
  <!-- Botón de exportación a PDF -->
</div>
```

#### 4.2 Tarjeta de Usuario
```html
<mat-card class="user-card-compact">
  <!-- Avatar del usuario (foto o icono) -->
  <div class="user-avatar-large">
    <!-- Muestra userImage si existe -->
    <img *ngIf="searchResults()?.user?.userImage" 
         [src]="searchResults()?.user?.userImage">
    <!-- Icono por defecto si no hay imagen -->
    <mat-icon *ngIf="!searchResults()?.user?.userImage">account_circle</mat-icon>
  </div>
  
  <!-- Información del usuario -->
  <div class="user-info-compact">
    <!-- Nombre completo -->
    <!-- Código de usuario -->
    <!-- Rol del sistema -->
    <!-- Email -->
  </div>
</mat-card>
```

#### 4.3 Estadísticas Visuales
```html
<div class="stats-grid-modern">
  <!-- 4 tarjetas de estadísticas con colores distintivos -->
  
  <!-- Tarjeta 1: Total de Actividades (Azul) -->
  <div class="stat-card-modern stat-primary">
    <!-- Icono + Número + Etiqueta -->
  </div>
  
  <!-- Tarjeta 2: Fecha de Inicio (Info) -->
  <div class="stat-card-modern stat-info">
    <!-- Icono + Fecha + Etiqueta -->
  </div>
  
  <!-- Tarjeta 3: Fecha de Fin (Verde) -->
  <div class="stat-card-modern stat-success">
    <!-- Icono + Fecha + Etiqueta -->
  </div>
  
  <!-- Tarjeta 4: Módulos Utilizados (Amarillo) -->
  <div class="stat-card-modern stat-warning">
    <!-- Icono + Número + Etiqueta -->
  </div>
</div>
```

#### 4.4 Gráfico de Barras por Módulo
```html
<mat-card class="module-breakdown-card">
  <!-- Título: Distribución por Módulo -->
  
  <div class="module-bars">
    <!-- Para cada módulo con actividades -->
    <div *ngFor="let item of searchResults()?.moduleBreakdown | keyvalue" 
         class="module-bar-item">
      
      <!-- Header: Icono + Nombre + Contador -->
      <div class="module-bar-header">
        <mat-icon>{{ getModuleIcon(item.key) }}</mat-icon>
        <span>{{ getModuleLabel(item.key) }}</span>
        <span>{{ item.value }}</span>
      </div>
      
      <!-- Barra de progreso con color del módulo -->
      <div class="module-bar-container">
        <div class="module-bar-fill" 
             [class]="'module-' + item.key.toLowerCase()"
             [style.width.%]="(item.value / searchResults()!.totalActivities) * 100">
        </div>
      </div>
    </div>
  </div>
</mat-card>
```

#### 4.5 Timeline de Actividades
```html
<mat-card class="activities-timeline-card">
  <!-- Título: Línea de Tiempo de Actividades -->
  
  <div class="timeline-container">
    <!-- Para cada actividad -->
    <div *ngFor="let activity of searchResults()?.activities; let i = index; let isLast = last" 
         class="timeline-item">
      
      <!-- Marcador de la línea de tiempo -->
      <div class="timeline-marker">
        <!-- Punto con icono del módulo -->
        <div class="timeline-dot" [class]="'timeline-dot-' + activity.module.toLowerCase()">
          <mat-icon>{{ getModuleIcon(activity.module) }}</mat-icon>
        </div>
        <!-- Línea conectora (excepto en el último) -->
        <div *ngIf="!isLast" class="timeline-line"></div>
      </div>
      
      <!-- Contenido de la actividad -->
      <div class="timeline-content">
        <div class="timeline-card">
          <!-- Header: Título + Chip de módulo + Hora -->
          <div class="timeline-card-header">
            <h4>{{ activity.action }}</h4>
            <mat-chip>{{ getModuleLabel(activity.module) }}</mat-chip>
            <span>{{ activity.timestamp | date:'short' }}</span>
          </div>
          
          <!-- Descripción de la actividad -->
          <p>{{ activity.description }}</p>
          
          <!-- Metadata: IP, Navegador, Componente -->
          <div class="timeline-metadata">
            <span *ngIf="activity.metadata.ip">
              <mat-icon>computer</mat-icon>
              {{ activity.metadata.ip }}
            </span>
            <span *ngIf="activity.metadata.browser">
              <mat-icon>web</mat-icon>
              {{ activity.metadata.browser }}
            </span>
            <span>
              <mat-icon>code</mat-icon>
              {{ activity.component }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mensaje cuando no hay actividades -->
  <div *ngIf="!searchResults()?.activities || searchResults()!.activities.length === 0" 
       class="no-activities-message">
    <mat-icon>info</mat-icon>
    <p>No se encontraron actividades en el período seleccionado</p>
  </div>
</mat-card>
```

### 5. Estado Sin Resultados
```html
<div *ngIf="!searchResults() && !loading()" class="no-results">
  <!-- Icono + Mensaje -->
  <!-- Se muestra cuando no hay búsqueda activa -->
</div>
```

---

## Estilos SCSS (reports.scss)

### Variables de Color

```scss
// Paleta de colores
$primary-blue: #2563eb;         // Azul principal
$primary-blue-light: #3b82f6;   // Azul claro
$primary-blue-dark: #1d4ed8;    // Azul oscuro
$success-emerald: #10b981;      // Verde esmeralda
$warning-amber: #f59e0b;        // Ámbar
$error-red: #ef4444;            // Rojo

// Escala de grises
$gray-50: #f8fafc;   // Gris muy claro
$gray-100: #f1f5f9;  // Gris claro
// ... hasta $gray-900
```

### Clases Principales

#### .reports-container
Contenedor principal del módulo:
- Display: block
- Width: 100vw
- Height: 100vh
- Background: Gradiente gris claro
- Overflow: auto

#### .reports-header
Header fijo en la parte superior:
- Position: sticky
- Top: 0
- Background: Blanco con transparencia
- Backdrop-filter: blur(20px)
- Border-radius: 16px
- Box-shadow: Sombra suave
- Z-index: 100

#### .search-form-modern
Formulario de búsqueda moderno:
- Background: Gradiente gris a blanco
- Padding: 20px
- Border-radius: 12px
- Border: 1px solid gris
- Box-shadow: Sombra suave

#### .field-modern
Campos de formulario mejorados:
- Background: Blanco
- Border-radius: 8px
- Transition: all 0.3s ease
- Hover: Box-shadow azul

#### .results-section-modern
Sección de resultados mejorada:
- Margin-top: 32px
- Display: flex
- Flex-direction: column
- Gap: 24px

#### .report-header
Header del reporte con gradiente:
- Background: Gradiente azul
- Color: Blanco
- Border-radius: 12px
- Box-shadow: Sombra azul
- Padding: 20px 24px

#### .user-card-compact
Tarjeta de usuario compacta:
- Background: Blanco
- Border-radius: 12px
- Border-left: 4px solid azul
- Box-shadow: Sombra suave

#### .user-avatar-large
Avatar grande del usuario:
- Width: 80px
- Height: 80px
- Border-radius: 50%
- Background: Gradiente azul claro
- Border: 3px solid blanco
- Box-shadow: Sombra suave
- Overflow: hidden (para la imagen)

#### .user-avatar-img
Imagen del usuario:
- Width: 100%
- Height: 100%
- Object-fit: cover
- Border-radius: 50%

#### .stats-grid-modern
Grid de estadísticas:
- Display: grid
- Grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))
- Gap: 20px

#### .stat-card-modern
Tarjeta de estadística:
- Background: Blanco
- Border-radius: 12px
- Padding: 24px
- Display: flex
- Gap: 20px
- Box-shadow: Sombra suave
- Transition: all 0.3s ease
- Hover: Transform translateY(-4px)

Variantes de color:
- `.stat-primary`: Borde azul
- `.stat-info`: Borde azul claro
- `.stat-success`: Borde verde
- `.stat-warning`: Borde amarillo

#### .module-breakdown-card
Tarjeta de desglose por módulo:
- Contiene barras horizontales con gradientes
- Cada módulo tiene su color único

#### .module-bar-fill
Barra de progreso del módulo:
- Height: 100%
- Border-radius: 6px
- Transition: width 0.6s ease
- Background: Gradiente según módulo

Colores por módulo:
- `.module-auth`: Azul (#3b82f6)
- `.module-profile`: Púrpura (#8b5cf6)
- `.module-machines`: Naranja (#f59e0b)
- `.module-design`: Rosa (#ec4899)
- `.module-reports`: Verde (#10b981)
- `.module-settings`: Índigo (#6366f1)

#### .activities-timeline-card
Tarjeta con timeline de actividades:
- Diseño de línea de tiempo vertical
- Puntos de colores según módulo
- Líneas conectoras entre actividades

#### .timeline-item
Item individual de la timeline:
- Display: flex
- Gap: 20px
- Position: relative

#### .timeline-marker
Marcador de la timeline:
- Display: flex
- Flex-direction: column
- Align-items: center

#### .timeline-dot
Punto de la timeline:
- Width: 48px
- Height: 48px
- Border-radius: 50%
- Box-shadow: Sombra
- Background: Gradiente según módulo
- Z-index: 2

#### .timeline-line
Línea conectora:
- Width: 2px
- Background: Gradiente gris
- Margin-top: 8px
- Min-height: 40px

#### .timeline-card
Tarjeta de actividad:
- Background: Gris claro
- Border-radius: 12px
- Padding: 20px
- Border: 1px solid gris
- Transition: all 0.3s ease
- Hover: Background blanco + Transform translateX(4px)

### Responsive Design

```scss
@media (max-width: 768px) {
  // Adaptaciones para móviles:
  // - Header apilado verticalmente
  // - Usuario centrado
  // - Stats en una columna
  // - Timeline optimizada
}
```

---

## Flujo de Datos

### 1. Inicialización
```
ngOnInit() → loadAvailableUsers() → availableUsers signal actualizada
```

### 2. Búsqueda de Actividades
```
Usuario completa formulario
  ↓
Click en "Buscar"
  ↓
searchUserActivities()
  ↓
Validación del formulario
  ↓
HTTP GET a /api/reports/user-activities/{userCode}
  ↓
Backend procesa y retorna datos
  ↓
calculateModuleBreakdown()
  ↓
searchResults signal actualizada
  ↓
Template se actualiza automáticamente (reactividad)
  ↓
Visualización de resultados
```

### 3. Exportación a PDF
```
Click en "Exportar PDF"
  ↓
exportToPDF()
  ↓
generatePDFContent()
  ↓
Crear Blob
  ↓
Descargar archivo
```

---

## Características Principales

### 1. Reactividad con Signals
- Sistema moderno de reactividad de Angular
- Actualizaciones automáticas del template
- Mejor rendimiento que Observables

### 2. Formularios Reactivos
- Validación en tiempo real
- Control de estado del formulario
- Fácil acceso a valores

### 3. Autocompletado de Usuarios
- Búsqueda rápida de usuarios
- Sugerencias mientras se escribe
- Mejora la experiencia de usuario

### 4. Formato de Fecha Personalizado
- Formato español: dd/mm/aaaa
- Datepicker con calendario visual
- Entrada manual de fechas

### 5. Visualización Moderna
- Diseño limpio y profesional
- Colores distintivos por módulo
- Animaciones suaves
- Timeline visual de actividades

### 6. Responsive Design
- Adaptación completa a móviles
- Grid flexible
- Elementos apilados en pantallas pequeñas

### 7. Exportación de Reportes
- Generación de PDF
- Descarga automática
- Nombre de archivo con fecha

---

## Integración con Backend

### Endpoint Principal
```
GET /api/reports/user-activities/{userCode}
```

### Parámetros de Query
- `startDate`: Fecha de inicio (ISO format)
- `endDate`: Fecha de fin (ISO format)
- `module`: Módulo a filtrar (opcional)

### Respuesta Esperada
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "userId": "1",
      "userCode": "admin",
      "action": "LOGIN",
      "description": "Inicio de sesión exitoso",
      "module": "AUTH",
      "component": "LoginComponent",
      "timestamp": "2024-11-20T10:30:00",
      "metadata": {
        "ip": "192.168.1.100",
        "browser": "Chrome 120"
      }
    }
  ],
  "message": "Se encontraron X actividades"
}
```

---

## Mejoras Futuras

1. **Gráficos Interactivos**
   - Integrar Chart.js o D3.js
   - Gráficos de barras, líneas y torta
   - Visualización de tendencias

2. **Filtros Avanzados**
   - Filtro por rango de horas
   - Filtro por tipo de acción
   - Filtro por IP o navegador

3. **Exportación Mejorada**
   - Exportar a Excel
   - Exportar a CSV
   - PDF con gráficos

4. **Comparación de Períodos**
   - Comparar actividades entre fechas
   - Mostrar diferencias y tendencias

5. **Notificaciones en Tiempo Real**
   - WebSockets para actividades en vivo
   - Alertas de actividades sospechosas

6. **Búsqueda Avanzada**
   - Búsqueda por texto en descripciones
   - Filtros combinados
   - Guardado de búsquedas frecuentes

---

## Mantenimiento

### Actualizar Módulos
Para agregar un nuevo módulo al sistema:

1. Agregar en `moduleOptions` (reports.ts):
```typescript
{ value: 'NUEVO_MODULO', label: 'Nuevo Módulo' }
```

2. Agregar icono en `getModuleIcon()`:
```typescript
'NUEVO_MODULO': 'icon_name'
```

3. Agregar color en SCSS:
```scss
&.module-nuevo_modulo {
  background: linear-gradient(90deg, #color1 0%, #color2 100%);
}
```

### Actualizar Formato de Fecha
Modificar `MY_DATE_FORMATS` en reports.ts:
```typescript
export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: { dateInput: 'DD/MM/YYYY', /* ... */ }
};
```

---

## Solución de Problemas

### Error 500 al buscar actividades
- Verificar que el backend esté corriendo
- Verificar que la tabla Activities exista
- Verificar que haya datos de prueba

### No se muestra la imagen del usuario
- Verificar que el campo `userImage` exista en el modelo User
- Verificar que la URL de la imagen sea válida
- Verificar permisos CORS si la imagen está en otro dominio

### Fechas no se formatean correctamente
- Verificar que MAT_DATE_LOCALE esté configurado
- Verificar que MAT_DATE_FORMATS esté configurado
- Verificar imports de MatNativeDateModule

### Autocompletado no funciona
- Verificar que availableUsers tenga datos
- Verificar que displayUserCode esté implementado
- Verificar binding [matAutocomplete]

---

## Créditos

Desarrollado para FlexoAPP - Sistema de Gestión Flexográfica
Versión: 1.0.0
Fecha: Noviembre 2024

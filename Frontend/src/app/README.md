# 📱 Estructura de la Aplicación Angular

Documentación de la estructura y organización de componentes de FlexoAPP Frontend.

---

## 📂 Organización de Carpetas

```
src/app/
├── auth/                       # Módulo de Autenticación
├── core/                       # Funcionalidades Core
├── shared/                     # Componentes Compartidos
├── app.config.ts               # Configuración de la aplicación
├── app.routes.ts               # Definición de rutas
├── app.html                    # Template principal
└── app.ts                      # Componente raíz
```

---

## 🔐 Auth Module (`/auth`)

Módulo de autenticación y gestión de usuarios.

### Componentes

#### 1. Login (`/auth/login`)
- **Ruta:** `/login`
- **Función:** Autenticación de usuarios
- **Archivos:**
  - `login.ts` - Lógica del componente
  - `login.html` - Template
  - `login.scss` - Estilos

**Características:**
- Formulario de login
- Validación de credenciales
- Manejo de errores
- Redirección post-login

#### 2. Profile (`/auth/profile`)
- **Ruta:** `/profile`
- **Función:** Gestión de perfil de usuario
- **Archivos:**
  - `profile.ts` - Lógica del componente
  - `profile.html` - Template
  - `profile.scss` - Estilos

**Características:**
- Visualización de datos de usuario
- Actualización de foto de perfil
- Cambio de contraseña
- Información de sesión

#### 3. Settings (`/auth/settings`)
- **Ruta:** `/settings`
- **Función:** Administración de usuarios
- **Archivos:**
  - `settings.ts` - Lógica del componente
  - `settings.html` - Template
  - `settings.scss` - Estilos

**Sub-componentes:**
- `create-user-dialog/` - Diálogo de creación de usuarios
- `edit-user-dialog/` - Diálogo de edición de usuarios

**Características:**
- Lista de usuarios
- Crear nuevos usuarios
- Editar usuarios existentes
- Eliminar usuarios
- Gestión de permisos

---

## 🎯 Core Module (`/core`)

Servicios y funcionalidades centrales de la aplicación.

### Guards (`/core/guards`)

#### AuthGuard (`auth.guard.ts`)
- Protección de rutas
- Verificación de autenticación
- Redirección a login si no autenticado

### Interceptors (`/core/interceptors`)

#### 1. Auth Interceptor (`auth.interceptor.ts`)
- Añade token JWT a requests
- Manejo de errores 401
- Logout automático en token inválido

#### 2. Loading Interceptor (`loading.interceptor.ts`)
- Muestra/oculta indicador de carga
- Control de estado de loading

#### 3. Network Stability Interceptor (`network-stability.interceptor.ts`)
- Monitoreo de estabilidad de red
- Reintentos automáticos
- Fallback URLs

### Services (`/core/services`)

#### 1. AuthService (`auth.service.ts`)
**Funciones:**
- Login/Logout
- Gestión de tokens
- Validación de sesión
- Obtener usuario actual
- Actualizar perfil

#### 2. DashboardService (`dashboard.service.ts`)
**Funciones:**
- Obtener estadísticas
- Datos del dashboard
- Métricas del sistema

#### 3. LanguageService (`language.service.ts`)
**Funciones:**
- Cambio de idioma
- Traducciones
- Persistencia de preferencias

#### 4. LoadingService (`loading.service.ts`)
**Funciones:**
- Control de estado de carga
- Mostrar/ocultar loader
- Observable de loading state

#### 5. NetworkDiagnosticService (`network-diagnostic.service.ts`)
**Funciones:**
- Diagnóstico de red
- Pruebas de conectividad
- Reportes de estado

#### 6. NetworkStabilityService (`network-stability.service.ts`)
**Funciones:**
- Monitoreo de estabilidad
- Detección de problemas
- Notificaciones de estado

#### 7. NotificationService (`notification.service.ts`)
**Funciones:**
- Mostrar notificaciones
- Toasts de éxito/error
- Alertas personalizadas

#### 8. SessionTimeoutService (`session-timeout.service.ts`)
**Funciones:**
- Control de timeout de sesión
- Detección de inactividad
- Logout automático

#### 9. ThemeService (`theme.service.ts`)
**Funciones:**
- Cambio de tema (claro/oscuro)
- Persistencia de preferencias
- Aplicación de estilos

#### 10. TimeFormatService (`time-format.service.ts`)
**Funciones:**
- Formateo de fechas/horas
- Conversión de zonas horarias
- Formatos personalizados

---

## 🔄 Shared Module (`/shared`)

Componentes, servicios y utilidades compartidas.

### Components (`/shared/components`)

#### 1. Dashboard (`/dashboard`)
- **Función:** Panel principal de control
- **Características:**
  - Estadísticas generales
  - Gráficos
  - Resumen de actividades

#### 2. Diseño (`/diseño`)
- **Función:** Gestión de diseños
- **Características:**
  - Lista de diseños
  - Crear/editar diseños
  - Visualización de detalles
  - Exportación

#### 3. Documento (`/documento`)
- **Función:** Gestión de documentos
- **Características:**
  - Lista de documentos
  - Subir documentos
  - Descargar documentos
  - Conversión a PDF

#### 4. Máquinas (`/machines`)
- **Función:** Gestión de máquinas
- **Características:**
  - Lista de máquinas
  - Estado de máquinas
  - Programación
  - Historial

#### 5. Pedidos (integrado en otros componentes)
- **Función:** Gestión de pedidos
- **Características:**
  - Lista de pedidos
  - Crear/editar pedidos
  - Estado de pedidos
  - Seguimiento

#### 6. Reports (`/reports`)
- **Función:** Generación de reportes
- **Características:**
  - Reportes de máquinas
  - Reportes de producción
  - Exportación a Excel/PDF
  - Filtros personalizados

#### 7. Condición Única (`/condicion-unica`)
- **Función:** Gestión de condiciones únicas
- **Características:**
  - Lista de condiciones
  - Crear/editar condiciones
  - Validación

#### 8. Header (`/header`)
- **Función:** Barra de navegación superior
- **Características:**
  - Menú de navegación
  - Perfil de usuario
  - Notificaciones
  - Cambio de idioma/tema

#### 9. Información (`/informacion`)
- **Función:** Información del sistema
- **Características:**
  - Acerca de
  - Versión
  - Ayuda

#### 10. Print FF459 (`/print-ff459`)
- **Función:** Impresión de formato FF459
- **Características:**
  - Vista previa
  - Generación de PDF
  - Impresión

### Pipes (`/shared/pipes`)

#### TranslatePipe (`translate.pipe.ts`)
- Traducción de textos
- Soporte multi-idioma
- Parámetros dinámicos

### Services (`/shared/services`)

#### 1. CondicionUnicaService
**Funciones:**
- CRUD de condiciones únicas
- Validación
- Búsqueda

#### 2. DocumentoService
**Funciones:**
- CRUD de documentos
- Subida de archivos
- Descarga de archivos
- Conversión a PDF

---

## 🛣️ Rutas de la Aplicación

### Rutas Públicas
- `/login` - Página de login

### Rutas Protegidas (requieren autenticación)
- `/` - Dashboard principal
- `/profile` - Perfil de usuario
- `/settings` - Configuración y gestión de usuarios
- `/diseño` - Gestión de diseños
- `/documento` - Gestión de documentos
- `/machines` - Gestión de máquinas
- `/reports` - Reportes
- `/condicion-unica` - Condiciones únicas
- `/informacion` - Información del sistema

---

## 🔧 Configuración de la Aplicación

### app.config.ts

**Providers configurados:**
- Router con preloading
- HTTP Client con interceptors
- Animaciones
- Servicios core

**Interceptors activos:**
- authInterceptor
- loadingInterceptor
- networkStabilityInterceptor

---

## 📊 Flujo de Datos

```
Usuario → Componente → Servicio → HTTP Client → Backend API
                ↓
            NgRx Store (estado global)
                ↓
            Componentes suscritos
```

---

## 🎨 Estilos

### Estilos Globales
- `src/styles.scss` - Estilos base
- `src/styles/themes.scss` - Temas

### Estilos por Componente
- Cada componente tiene su archivo `.scss`
- Scoped styles (encapsulación)
- Variables de tema compartidas

---

## 🔄 Ciclo de Vida de Componentes

### Hooks Utilizados
- `ngOnInit()` - Inicialización
- `ngOnDestroy()` - Limpieza (unsubscribe)
- `ngAfterViewInit()` - Post-renderizado
- `ngOnChanges()` - Cambios en inputs

---

## 📝 Convenciones de Código

### Naming
- **Componentes:** PascalCase (ej: `DashboardComponent`)
- **Servicios:** PascalCase + Service (ej: `AuthService`)
- **Archivos:** kebab-case (ej: `auth.service.ts`)

### Estructura de Archivos
```
component-name/
├── component-name.ts       # Lógica
├── component-name.html     # Template
└── component-name.scss     # Estilos
```

---

## 🚀 Mejores Prácticas

### Componentes
- ✅ Standalone components
- ✅ OnPush change detection
- ✅ Inputs/Outputs tipados
- ✅ Unsubscribe en ngOnDestroy

### Servicios
- ✅ Inyección de dependencias
- ✅ Observables para async
- ✅ Error handling
- ✅ Logging

### Estado
- ✅ NgRx para estado global
- ✅ BehaviorSubject para estado local
- ✅ Immutability

---

**Última actualización:** 21 de Diciembre de 2025

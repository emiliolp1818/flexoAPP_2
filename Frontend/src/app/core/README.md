# Core Module

## 📋 Descripción
Módulo central que contiene servicios, interceptors, guards y constantes compartidas por toda la aplicación.

## 🏗️ Estructura
```
core/
├── constants/         # Constantes de la aplicación
├── guards/           # Guards de protección de rutas
├── interceptors/     # Interceptors HTTP
├── services/         # Servicios centrales
└── README.md         # Esta documentación
```

## 🛡️ Guards

### AuthGuard
- **Propósito**: Proteger rutas que requieren autenticación
- **Implementación**: CanActivate interface
- **Redirección**: A `/auth/login` si no autenticado

### RoleGuard
- **Propósito**: Control de acceso basado en roles
- **Implementación**: CanActivate interface
- **Validación**: Permisos específicos por ruta

## 🔄 Interceptors

### StabilityInterceptor
- **Propósito**: Manejo robusto de errores HTTP
- **Funcionalidades**:
  - Reintentos automáticos
  - Manejo de timeouts
  - Logging de errores
  - Fallback responses

### AuthInterceptor
- **Propósito**: Inyección automática de tokens JWT
- **Funcionalidades**:
  - Headers de autorización
  - Refresh token automático
  - Logout en token expirado

### CacheInterceptor
- **Propósito**: Caché inteligente de respuestas HTTP
- **Funcionalidades**:
  - Caché en memoria
  - TTL configurable
  - Invalidación selectiva

## 🔧 Servicios

### ApiService
- **Propósito**: Cliente HTTP centralizado
- **Funcionalidades**:
  - CRUD operations
  - Error handling
  - Response transformation
  - Base URL management

### AuthService
- **Propósito**: Gestión de autenticación
- **Funcionalidades**:
  - Login/logout
  - Token management
  - User state
  - Session persistence

### NotificationService
- **Propósito**: Sistema de notificaciones
- **Funcionalidades**:
  - Toast messages
  - Error alerts
  - Success confirmations
  - Custom notifications

### LoadingService
- **Propósito**: Control de estados de carga
- **Funcionalidades**:
  - Loading spinners
  - Progress bars
  - Overlay management
  - Global loading state

## 📊 Constants

### API_ENDPOINTS
- URLs de endpoints del backend
- Configuración por ambiente
- Versionado de API

### APP_CONFIG
- Configuración general de la app
- Timeouts y límites
- Feature flags

### ERROR_MESSAGES
- Mensajes de error estandarizados
- Internacionalización
- Códigos de error

## 🎯 Características Clave

### Singleton Services
- Instancia única por aplicación
- Estado global compartido
- Inyección en root

### Error Handling
- Manejo centralizado de errores
- Logging estructurado
- User-friendly messages
- Retry mechanisms

### Performance
- Lazy loading compatible
- Tree-shaking optimized
- Memory leak prevention
- Efficient caching

## 📋 Dependencias
- `@angular/common/http` - Cliente HTTP
- `@angular/router` - Navegación y guards
- `rxjs` - Programación reactiva
- `@angular/core` - Inyección de dependencias

## 🔄 Flujo de Datos
1. **Request** → AuthInterceptor → StabilityInterceptor
2. **Response** → CacheInterceptor → Error Handling
3. **State** → Services → Components
4. **Navigation** → Guards → Route Protection

## 🛠️ Optimizaciones
- **Providedln: 'root'** para tree-shaking
- **OnDestroy** para cleanup
- **Debounce/Throttle** en operaciones costosas
- **Memoization** en cálculos repetitivos
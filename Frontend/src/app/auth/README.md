# Auth Module

## 📋 Descripción
Módulo de autenticación y autorización de la aplicación FlexoAPP.

## 🏗️ Estructura
```
auth/
├── login/              # Componente de login
├── index.ts           # Barrel exports
└── README.md          # Esta documentación
```

## 🔧 Componentes

### Login Component
- **Propósito**: Formulario de autenticación de usuarios
- **Tecnologías**: Angular Reactive Forms, RxJS
- **Validaciones**: Email, contraseña requerida
- **Integración**: JWT tokens, HttpClient

## 🔐 Funcionalidades

### Autenticación
- Login con email/contraseña
- Validación de formularios reactivos
- Manejo de errores de autenticación
- Redirección automática post-login

### Seguridad
- Tokens JWT
- Interceptors de autenticación
- Guards de protección de rutas
- Logout automático por expiración

## 📡 Servicios Utilizados

### AuthService (Core)
- Gestión de tokens
- Estado de autenticación
- Comunicación con backend
- Persistencia de sesión

### HttpClient
- Peticiones de login/logout
- Interceptors automáticos
- Manejo de errores HTTP

## 🎯 Rutas
- `/auth/login` - Página de login
- Redirección automática a `/dashboard` tras login exitoso

## 🔄 Flujo de Autenticación
1. Usuario ingresa credenciales
2. Validación de formulario
3. Petición HTTP al backend
4. Almacenamiento de token JWT
5. Redirección a dashboard
6. Activación de guards de protección

## 📋 Dependencias
- `@angular/forms` - Formularios reactivos
- `@angular/common/http` - Cliente HTTP
- `rxjs` - Programación reactiva
- `@angular/router` - Navegación

## 🛠️ Optimizaciones
- **OnPush** change detection
- **Lazy loading** del módulo
- **Form validation** en tiempo real
- **Error handling** robusto
# 📱 FlexoAPP Frontend

Sistema de gestión flexográfica - Interfaz de usuario desarrollada en Angular.

---

## 🚀 Tecnologías Utilizadas

### Core
- **Angular:** 20.3.x
- **TypeScript:** ~5.7.2
- **RxJS:** ~7.8.0
- **Zone.js:** ~0.15.0

### UI/UX
- **Angular Material:** ^18.2.14
- **Chart.js:** ^4.4.7
- **ng2-charts:** ^8.0.2

### Estado y Datos
- **NgRx Store:** ^18.1.1
- **Socket.IO Client:** ^4.8.1

### Internacionalización
- **ngx-translate/core:** ^16.0.3
- **ngx-translate/http-loader:** ^9.0.0

### Notificaciones
- **ngx-toastr:** ^19.0.0

---

## 📂 Estructura del Proyecto

```
Frontend/
├── public/                     # Assets públicos
│   ├── images/                 # Imágenes (logos, iconos, fondos)
│   └── templates/              # Templates HTML
│
├── src/
│   ├── app/
│   │   ├── auth/               # Módulo de autenticación
│   │   │   ├── login/          # Componente de login
│   │   │   ├── profile/        # Perfil de usuario
│   │   │   └── settings/       # Configuración y gestión de usuarios
│   │   │
│   │   ├── core/               # Servicios y funcionalidades core
│   │   │   ├── guards/         # Guards de rutas
│   │   │   ├── interceptors/   # HTTP interceptors
│   │   │   └── services/       # Servicios principales
│   │   │
│   │   ├── shared/             # Componentes y servicios compartidos
│   │   │   ├── components/     # Componentes reutilizables
│   │   │   ├── pipes/          # Pipes personalizados
│   │   │   └── services/       # Servicios compartidos
│   │   │
│   │   ├── app.config.ts       # Configuración de la aplicación
│   │   ├── app.routes.ts       # Definición de rutas
│   │   └── app.ts              # Componente raíz
│   │
│   ├── styles/                 # Estilos globales
│   │   └── themes.scss         # Temas de la aplicación
│   │
│   ├── environments/           # Configuraciones de entorno
│   │   ├── environment.ts      # Entorno por defecto
│   │   ├── environment.local.ts
│   │   ├── environment.prod.ts
│   │   └── environment.hybrid.ts
│   │
│   └── styles.scss             # Estilos globales principales
│
├── angular.json                # Configuración de Angular
├── package.json                # Dependencias del proyecto
└── tsconfig.json               # Configuración de TypeScript
```

---

## 🛠️ Comandos de Desarrollo

### Instalación
```bash
npm install
```

### Desarrollo
```bash
# Servidor de desarrollo (puerto 4200)
ng serve

# Servidor con configuración específica
ng serve --configuration=local
ng serve --configuration=production
ng serve --configuration=hybrid
```

### Compilación
```bash
# Build de desarrollo
ng build

# Build de producción
ng build --configuration=production

# Build con configuración específica
ng build --configuration=local
```

### Pruebas
```bash
# Ejecutar tests unitarios
ng test

# Ejecutar tests e2e
ng e2e
```

---

## 🔧 Configuración

### Entornos Disponibles

#### Development (por defecto)
- API URL: `http://localhost:7003`
- Debug: Habilitado
- Logging: Completo

#### Local Network
- API URL: `http://192.168.1.20:7003`
- Fallback URLs configurados
- Network stability checks

#### Production
- API URL: Configuración de producción
- Debug: Deshabilitado
- Optimizaciones habilitadas

#### Hybrid
- Configuración mixta para desarrollo/producción

---

## 📦 Módulos Principales

### Auth Module
- **Login:** Autenticación de usuarios
- **Profile:** Gestión de perfil de usuario
- **Settings:** Administración de usuarios y permisos

### Core Module
- **Guards:** Protección de rutas (AuthGuard)
- **Interceptors:** 
  - Auth Interceptor (JWT)
  - Loading Interceptor
  - Network Stability Interceptor
- **Services:**
  - AuthService
  - DashboardService
  - LanguageService
  - NotificationService
  - ThemeService
  - SessionTimeoutService

### Shared Module
- **Components:**
  - Dashboard
  - Diseño
  - Documento
  - Máquinas
  - Pedidos
  - Reportes
  - Condición Única
  - Header
  - Información
- **Pipes:**
  - TranslatePipe
- **Services:**
  - CondicionUnicaService
  - DocumentoService
  - TimeFormatService

---

## 🎨 Características

### Interfaz de Usuario
- ✅ Material Design (Angular Material)
- ✅ Responsive Design
- ✅ Temas personalizables
- ✅ Modo oscuro/claro

### Funcionalidades
- ✅ Autenticación JWT
- ✅ Gestión de sesiones
- ✅ Timeout automático
- ✅ Internacionalización (i18n)
- ✅ Notificaciones en tiempo real
- ✅ Gráficos y estadísticas
- ✅ Exportación de reportes
- ✅ Gestión de documentos
- ✅ Sistema de permisos

### Comunicación
- ✅ HTTP Client con interceptors
- ✅ WebSocket (Socket.IO)
- ✅ Manejo de errores
- ✅ Network stability checks
- ✅ Fallback URLs

---

## 🔐 Seguridad

- **JWT Authentication:** Tokens en localStorage
- **Auth Guard:** Protección de rutas
- **Auth Interceptor:** Headers automáticos
- **Session Timeout:** Control de inactividad
- **CORS:** Configurado para API backend

---

## 📊 Estado de la Aplicación

### NgRx Store
- Gestión centralizada de estado
- Actions, Reducers, Effects
- DevTools habilitado en desarrollo

---

## 🌐 Internacionalización

- **ngx-translate** configurado
- Soporte multi-idioma
- Traducciones dinámicas
- Cambio de idioma en tiempo real

---

## 📱 Responsive Design

- **Mobile First:** Diseño adaptable
- **Breakpoints:** Configurados para diferentes dispositivos
- **Touch Friendly:** Optimizado para pantallas táctiles

---

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/emiliolp1818/flexoAPP_2.git
   cd flexoAPP_localhost/Frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar entorno**
   - Editar `src/environments/environment.ts` si es necesario
   - Verificar URL del backend

4. **Iniciar desarrollo**
   ```bash
   ng serve
   ```

5. **Abrir navegador**
   - URL: `http://localhost:4200`
   - Login: admin / admin123

---

## 📝 Notas de Desarrollo

### Convenciones de Código
- **TypeScript:** Strict mode habilitado
- **Naming:** camelCase para variables, PascalCase para clases
- **Components:** Standalone components
- **Services:** Inyección de dependencias
- **Observables:** Uso de RxJS operators

### Buenas Prácticas
- ✅ Componentes standalone
- ✅ Lazy loading de módulos
- ✅ OnPush change detection
- ✅ Unsubscribe de observables
- ✅ Error handling
- ✅ Loading states

---

## 🔗 Enlaces Útiles

- **Repositorio:** https://github.com/emiliolp1818/flexoAPP_2
- **Angular Docs:** https://angular.dev
- **Material Design:** https://material.angular.io
- **NgRx:** https://ngrx.io

---

## 👥 Equipo

**FlexoAPP Team** - Desarrollo y mantenimiento

---

## 📄 Licencia

Este proyecto es privado y propiedad de FlexoAPP Team.

---

**Versión:** 2.2.0  
**Última actualización:** 21 de Diciembre de 2025

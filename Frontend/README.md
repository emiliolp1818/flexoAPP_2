# FlexoAPP Frontend

## 🚀 Tecnologías y Arquitectura

### Stack Principal
- **Angular 18+** - Framework principal
- **TypeScript** - Lenguaje de desarrollo
- **SCSS** - Preprocesador CSS
- **RxJS** - Programación reactiva
- **Chart.js** - Visualización de datos

### Infraestructura
- **Kestrel + Nginx/IIS** - Servidor web
- **HttpClient** - Cliente HTTP nativo de Angular
- **Socket.IO** - Comunicación en tiempo real

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── auth/           # Autenticación y autorización
│   ├── core/           # Servicios centrales y configuración
│   ├── pages/          # Páginas principales de la aplicación
│   ├── shared/         # Componentes y servicios compartidos
│   └── app.*           # Configuración principal de la app
├── assets/             # Recursos estáticos
├── environments/       # Configuraciones por ambiente
└── styles.scss         # Estilos globales
```

## ⚡ Optimizaciones de Rendimiento

### Lazy Loading
- Módulos cargados bajo demanda
- Rutas con carga diferida
- Componentes standalone optimizados

### HttpClient + RxJS
- Interceptors para manejo centralizado
- Operadores RxJS para transformación de datos
- Caché inteligente de peticiones

### Optimizaciones de Renderizado
- **TrackBy** en todas las listas *ngFor
- **OnPush** change detection strategy
- **Pipes personalizados** para transformaciones
- **Lazy loading** de imágenes

### Interceptors Implementados
- **Stability Interceptor** - Manejo de errores y reintentos
- **Auth Interceptor** - Inyección automática de tokens
- **Cache Interceptor** - Caché de respuestas HTTP

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
ng serve

# Build producción
ng build --prod

# Tests
ng test

# Linting
ng lint
```

## 🔧 Configuración

### Environments
- `environment.ts` - Desarrollo
- `environment.prod.ts` - Producción
- `environment.network.ts` - Configuración de red

### Rutas Principales
- `/auth/login` - Autenticación
- `/dashboard` - Panel principal
- `/machines` - Gestión de máquinas
- `/reports` - Reportes y análisis
- `/design` - Diseño de productos

## 📋 Buenas Prácticas Implementadas

1. **Arquitectura Modular** - Separación clara de responsabilidades
2. **Lazy Loading** - Carga diferida de módulos
3. **Interceptors** - Manejo centralizado de HTTP
4. **Guards** - Protección de rutas
5. **Services** - Lógica de negocio centralizada
6. **Interfaces** - Tipado fuerte con TypeScript
7. **SCSS Modular** - Estilos organizados por componente
8. **Error Handling** - Manejo robusto de errores
9. **Performance** - Optimizaciones de renderizado
10. **Responsive Design** - Adaptable a todos los dispositivos

## 🔐 Seguridad

- Autenticación JWT
- Guards de ruta
- Interceptors de seguridad
- Validación de formularios
- Sanitización de datos

## 📊 Monitoreo y Análisis

- Integración con Chart.js para dashboards
- Métricas de rendimiento
- Logging estructurado
- Error tracking

---

*Documentación actualizada: Octubre 2025*
# 🏭 FlexoAPP - Sistema de Gestión Flexográfica

Sistema completo de gestión para empresas de impresión flexográfica, desarrollado con .NET 8 y Angular 18.

## 📋 Descripción

FlexoAPP es una solución integral que permite gestionar máquinas flexográficas, diseños, usuarios y documentos de manera eficiente. Incluye dashboard en tiempo real, autenticación segura, y está optimizado para despliegue en la nube.

## 🏗️ Arquitectura del Sistema

```
FlexoAPP/
├── backend/           # API REST (.NET 8)
├── Frontend/          # Aplicación web (Angular 18)
├── Database/          # Scripts SQL automáticos
└── Deploy/           # Configuración de despliegue
```

### Stack Tecnológico

#### Backend
- **.NET 8.0** - Framework principal
- **Entity Framework Core** - ORM
- **MySQL** - Base de datos
- **JWT Bearer** - Autenticación
- **Serilog** - Logging estructurado
- **Swagger/OpenAPI** - Documentación

#### Frontend
- **Angular 18** - Framework SPA
- **TypeScript 5.9** - Lenguaje principal
- **Angular Material** - Componentes UI
- **Chart.js** - Visualizaciones
- **RxJS** - Programación reactiva
- **Socket.io** - Tiempo real

#### Base de Datos
- **MySQL 8.0+** - Base de datos principal
- **Railway** - Hosting de BD (producción)
- **Scripts automáticos** - Creación de tablas

#### Despliegue
- **Render** - Hosting de aplicaciones
- **Docker** - Contenedorización
- **Nginx** - Servidor web (frontend)

## 🚀 Inicio Rápido

### Prerrequisitos
- .NET 8.0 SDK
- Node.js 18+
- MySQL Server
- Git

### Instalación Local

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/emiliolp1818/flexoAPP_2.git
   cd flexoAPP_2
   ```

2. **Configurar base de datos**
   ```bash
   # Ejecutar scripts de BD
   mysql -u root -p < backend/Database/Scripts/00_MASTER_SETUP.sql
   ```

3. **Configurar backend**
   ```bash
   cd backend
   dotnet restore
   # Editar appsettings.json con tu connection string
   dotnet run
   ```

4. **Configurar frontend**
   ```bash
   cd Frontend
   npm install
   npm start
   ```

5. **Acceder a la aplicación**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:7003
   - Swagger: http://localhost:7003/swagger
   - Login: admin / admin123

## 🌐 Despliegue en Producción

### Render + Railway (Recomendado)

1. **Preparar rama de despliegue**
   ```bash
   git checkout render
   ```

2. **Configurar en Render**
   - Backend: Web Service con Dockerfile
   - Frontend: Static Site con build de Angular

3. **Configurar en Railway**
   - Base de datos MySQL
   - Variables de entorno configuradas

4. **URLs de producción**
   - Frontend: https://flexoapp-frontend.onrender.com
   - Backend: https://flexoapp-backend.onrender.com

### Variables de Entorno (Producción)

#### Backend
```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=hopper.proxy.rlwy.net;Port=43791;Database=railway;User=root;Password=***;SslMode=Required;
JWT_SECRET_KEY=FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
FRONTEND_URL=https://flexoapp-frontend.onrender.com
PORT=8080
```

#### Frontend
```bash
NODE_ENV=production
API_URL=https://flexoapp-backend.onrender.com/api
```

## 📊 Funcionalidades Principales

### 🔐 Autenticación y Usuarios
- Login seguro con JWT
- Gestión de usuarios y roles
- Permisos granulares
- Perfiles con foto
- Timeout de sesión automático

### 🏭 Gestión de Máquinas
- Máquinas flexográficas (11-21)
- Programas de producción
- Estados en tiempo real
- Orden de trabajo SAP (OT)
- Historial de cambios

### 🎨 Diseños Flexográficos
- Catálogo de diseños
- Gestión de colores (hasta 10)
- Sustratos y tipos de impresión
- Búsqueda y filtros avanzados
- Duplicación de diseños

### 📄 Gestión Documental
- Subida de archivos (PDF, Word, Excel)
- Visualizador integrado
- Categorización y etiquetado
- Control de acceso por niveles
- Estadísticas de uso

### 📊 Dashboard y Reportes
- Métricas en tiempo real
- Gráficos interactivos
- Estado de máquinas
- Actividad de usuarios
- Exportación de reportes

### 📋 Condiciones Únicas
- Gestión de artículos F
- Referencias y ubicaciones
- Estantes y carpetas
- Búsqueda rápida

## 🗄️ Base de Datos

### Tablas Principales
- **users** - Usuarios del sistema
- **Activities** - Log de actividades
- **designs** - Diseños flexográficos
- **maquinas** - Máquinas y programas
- **condicionunica** - Condiciones únicas
- **Documento** - Documentos del sistema
- **refresh_tokens** - Tokens JWT

### Scripts Automáticos
Los scripts SQL se ejecutan automáticamente al iniciar la aplicación:
- Creación de tablas si no existen
- Usuario administrador por defecto
- Índices y constraints optimizados
- Validaciones de integridad

## 🔧 API REST

### Endpoints Principales

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario actual

#### Máquinas
- `GET /api/maquinas` - Listar máquinas
- `POST /api/maquinas` - Crear programa
- `PUT /api/maquinas/{otSap}` - Actualizar programa

#### Diseños
- `GET /api/designs` - Listar diseños
- `POST /api/designs` - Crear diseño
- `PUT /api/designs/{id}` - Actualizar diseño

#### Documentación Completa
- Swagger UI: `/swagger`
- OpenAPI spec: `/swagger/v1/swagger.json`

## 🔐 Seguridad

### Características Implementadas
- **JWT Authentication** con refresh tokens
- **HTTPS** forzado en producción
- **CORS** configurado específicamente
- **SQL Injection** protección automática (EF Core)
- **XSS** sanitización de inputs
- **Rate Limiting** en endpoints críticos

### Roles y Permisos
- **Admin** - Acceso completo
- **Supervisor** - Gestión operativa
- **Operador** - Operaciones básicas
- **Prealistador** - Preparación de trabajos
- **Matizador** - Gestión de colores

## 📈 Performance y Optimización

### Backend
- Connection pooling MySQL
- Response compression (Gzip + Brotli)
- Memory caching
- Async/await operations
- Health checks automáticos

### Frontend
- Lazy loading de módulos
- OnPush change detection
- Service workers (PWA ready)
- Bundle optimization
- Image optimization

### Base de Datos
- Índices optimizados
- Constraints de validación
- Particionado por fecha (logs)
- Cleanup automático

## 🧪 Testing

### Backend
```bash
cd backend
dotnet test
```

### Frontend
```bash
cd Frontend
npm test
npm run e2e
```

### Coverage
- Unit tests: >80%
- Integration tests: >70%
- E2E tests: Flujos críticos

## 📊 Monitoreo

### Health Checks
- `/health` - Estado general
- `/health/ready` - Listo para tráfico
- `/health/live` - Aplicación viva

### Logging
- Serilog estructurado
- Archivos rotativos diarios
- Niveles configurables
- Correlación de requests

### Métricas
- Tiempo de respuesta
- Throughput
- Error rate
- Uso de memoria
- Conexiones de BD

## 🔧 Desarrollo

### Estructura de Ramas
- `main` - Producción estable
- `render` - Despliegue en Render/Railway
- `develop` - Desarrollo activo
- `feature/*` - Nuevas funcionalidades

### Convenciones
- **Backend**: C# conventions, async/await
- **Frontend**: Angular style guide, TypeScript strict
- **Database**: snake_case para columnas
- **API**: RESTful, camelCase JSON

### Scripts Útiles
```bash
# Desarrollo completo
./start-dual.bat

# Solo backend
cd backend && dotnet run

# Solo frontend
cd Frontend && npm start

# Despliegue
./deploy-render.bat
```

## 📞 Soporte y Troubleshooting

### Problemas Comunes

#### Error de conexión a BD
1. Verificar connection string
2. Verificar que MySQL esté ejecutándose
3. Verificar permisos de usuario

#### Error de CORS
1. Verificar configuración en Program.cs
2. Verificar URLs en environment files
3. Verificar configuración de Render

#### Error de autenticación
1. Verificar JWT_SECRET_KEY
2. Verificar que el token no haya expirado
3. Verificar configuración de cookies

### Logs y Debugging
- Backend logs: `backend/logs/flexoapp-*.log`
- Frontend console: F12 en navegador
- Health checks: `/health`
- API docs: `/swagger`

## 📄 Documentación Adicional

- [Backend README](backend/README.md)
- [Frontend README](Frontend/README.md)
- [Database Scripts](backend/Database/Scripts/README.md)
- [Deploy Guide](RENDER-DEPLOY-GUIDE.md)

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para historial de cambios.

## 📄 Licencia

Este proyecto es privado y propiedad de FlexoAPP Team.

---

## 🏆 Estado del Proyecto

- ✅ **Backend**: Completamente funcional
- ✅ **Frontend**: Interfaz completa
- ✅ **Base de Datos**: Scripts automáticos
- ✅ **Despliegue**: Render + Railway configurado
- ✅ **Documentación**: Completa y actualizada
- ✅ **Testing**: Cobertura básica implementada

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2026  
**Desarrollado por**: FlexoAPP Team  
**Tecnologías**: .NET 8 + Angular 18 + MySQL  
**Despliegue**: Render + Railway
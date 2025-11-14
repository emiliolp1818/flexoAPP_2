# 🎨 FlexoAPP - Sistema de Gestión Flexográfica

Sistema completo de gestión para empresas de impresión flexográfica, desarrollado con Angular y .NET Core.

## 🚀 Características

- **Gestión de Diseños**: Control completo de diseños y archivos
- **Programas de Máquinas**: Administración de programas de impresión
- **Pedidos**: Sistema de gestión de pedidos y seguimiento
- **Usuarios**: Control de acceso con roles y permisos
- **Reportes**: Generación de reportes y estadísticas
- **Tiempo Real**: Actualizaciones en tiempo real con SignalR
- **Backup Automático**: Sistema de respaldo automático de datos

## 🛠️ Tecnologías

### Frontend
- Angular 20
- Angular Material
- TypeScript
- RxJS
- Socket.IO Client
- Chart.js

### Backend
- .NET 8.0
- ASP.NET Core Web API
- Entity Framework Core
- MySQL
- SignalR
- JWT Authentication
- Serilog

## 📦 Instalación Local

### Requisitos Previos
- Node.js 18+
- .NET 8.0 SDK
- MySQL 8.0+

### 1. Clonar Repositorio
```bash
git clone https://github.com/emiliolp1818/flexoAPP_2.git
cd flexoAPP_2
```

### 2. Configurar Base de Datos
```bash
# ===== CREAR BASE DE DATOS EN MYSQL =====
# Conectar a MySQL con el usuario root
mysql -u root -p

# Crear la base de datos flexoapp_bd con soporte Unicode completo
CREATE DATABASE flexoapp_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar Backend
```bash
cd backend
# Editar appsettings.json con tus credenciales de MySQL
dotnet restore
dotnet run
```

### 4. Configurar Frontend
```bash
cd Frontend
npm install
npm start
```

### 5. Acceder a la Aplicación
- Frontend: http://localhost:4200
- Backend: http://localhost:7003
- Usuario: admin
- Contraseña: admin123

## 🚀 Despliegue en Render

### Opción Rápida (Recomendada)

1. **Preparar Base de Datos:**
   - Sigue la guía en [RAILWAY_DATABASE.md](RAILWAY_DATABASE.md)
   - Obtén tu cadena de conexión MySQL

2. **Desplegar en Render:**
   - Ve a [Render Dashboard](https://dashboard.render.com)
   - Click en "New +" → "Blueprint"
   - Conecta este repositorio
   - Configura la variable `DATABASE_URL`
   - Click en "Apply"

3. **Verificar:**
   - Espera 5-10 minutos
   - Visita tu aplicación

### Guías Detalladas
- [📘 Guía Completa de Despliegue](DEPLOY_RENDER.md)
- [🚂 Configurar Base de Datos en Railway](RAILWAY_DATABASE.md)
- [📋 Resumen de Configuración](RESUMEN_DESPLIEGUE.md)

## 🧪 Testing

### Verificar Build Local
```bash
# Windows
test-build.bat

# Verifica que todo compila correctamente antes de desplegar
```

### Verificar Configuración
```bash
# Windows
check-deploy-ready.bat

# Verifica que todos los archivos necesarios existen
```

## 📁 Estructura del Proyecto

```
flexoAPP_2/
├── backend/                 # Backend .NET
│   ├── Controllers/        # API Controllers
│   ├── Services/          # Business Logic
│   ├── Repositories/      # Data Access
│   ├── Models/            # Data Models
│   ├── Hubs/              # SignalR Hubs
│   └── Program.cs         # Entry Point
├── Frontend/               # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/      # Authentication
│   │   │   ├── core/      # Core Services
│   │   │   └── shared/    # Shared Components
│   │   └── environments/  # Environment Config
│   └── package.json
├── Dockerfile.backend      # Docker Config
├── render.yaml            # Render Blueprint
└── README.md
```

## 🔧 Configuración

### Variables de Entorno (Producción)

**Backend:**
```env
ASPNETCORE_ENVIRONMENT=Production
DATABASE_URL=Server=...;Database=...;Uid=...;Pwd=...;
JWT_SECRET_KEY=tu-clave-secreta
CORS_ORIGINS=https://tu-frontend.onrender.com
```

**Frontend:**
Edita `Frontend/src/environments/environment.prod.ts`

## 📊 Arquitectura

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       ↓
┌─────────────┐      ┌──────────────┐
│  Frontend   │ ───→ │   Backend    │
│  (Angular)  │ ←─── │   (.NET)     │
└─────────────┘      └──────┬───────┘
                            │
                            ↓
                     ┌──────────────┐
                     │    MySQL     │
                     │  (Database)  │
                     └──────────────┘
```

## 🔐 Seguridad

- Autenticación JWT
- Tokens de refresco automático
- CORS configurado
- Validación de datos
- Sanitización de inputs
- Logs de auditoría

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Obtener usuario actual

### Diseños
- `GET /api/designs` - Listar diseños
- `POST /api/designs` - Crear diseño
- `PUT /api/designs/{id}` - Actualizar diseño
- `DELETE /api/designs/{id}` - Eliminar diseño

### Programas de Máquinas
- `GET /api/machine-programs` - Listar programas
- `POST /api/machine-programs` - Crear programa
- `PUT /api/machine-programs/{id}` - Actualizar programa
- `DELETE /api/machine-programs/{id}` - Eliminar programa

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/{id}` - Actualizar pedido
- `DELETE /api/pedidos/{id}` - Eliminar pedido

## 🐛 Solución de Problemas

### Backend no inicia
```bash
# Verificar logs
cd backend
dotnet run --verbosity detailed
```

### Frontend no compila
```bash
# Limpiar cache
cd Frontend
rm -rf node_modules
npm install
```

### Error de conexión a base de datos
```bash
# Probar conexión
cd backend
# Editar test-connection.bat con tus credenciales
test-connection.bat
```

## 📚 Documentación Adicional

- [Swagger API Docs](http://localhost:7003/swagger) (desarrollo)
- [Guía de Despliegue](DEPLOY_RENDER.md)
- [Configuración de Base de Datos](RAILWAY_DATABASE.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 👥 Equipo

- **Desarrollo**: FlexoAPP Team
- **Contacto**: support@flexoapp.com

## 🎯 Roadmap

- [ ] Migración a PostgreSQL (opcional)
- [ ] App móvil (React Native)
- [ ] Integración con ERP
- [ ] Dashboard avanzado
- [ ] Notificaciones push
- [ ] Exportación a Excel mejorada
- [ ] Multi-idioma completo

## ⭐ Agradecimientos

Gracias por usar FlexoAPP!

---

**Versión**: 2.0.0  
**Última actualización**: Noviembre 2024

# FlexoAPP - Sistema de Gestión Flexográfica

## 📋 Descripción

FlexoAPP es un sistema completo de gestión para procesos flexográficos que incluye:
- Gestión de máquinas y programas
- Control de diseños y anilox
- Reportes y auditoría
- Sincronización en tiempo real con SignalR
- Importación/exportación de datos Excel

## 🏗️ Arquitectura

### Backend
- **Framework**: ASP.NET Core 8.0
- **Base de Datos**: MySQL 8.0+
- **ORM**: Entity Framework Core
- **Autenticación**: JWT Bearer Token
- **Tiempo Real**: SignalR WebSockets
- **Logging**: Serilog
- **Caché**: Memory Cache
- **Compresión**: Brotli + Gzip

### Frontend
- **Framework**: Angular 18
- **UI**: Angular Material
- **Gráficos**: Chart.js
- **Excel**: ExcelJS
- **PDF**: jsPDF
- **Estado**: RxJS

## 🚀 Entornos

### Desarrollo Local
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:4200`
- Base de Datos: MySQL local

### Producción (Railway)
- Backend: `https://[tu-dominio].up.railway.app`
- Frontend: `https://[tu-dominio-frontend].up.railway.app`
- Base de Datos: MySQL Railway

## 📁 Estructura del Proyecto

```
flexoAPP_2/
├── backend/                    # API .NET Core
│   ├── Controllers/           # Endpoints REST
│   ├── Models/               # Entidades y DTOs
│   ├── Services/             # Lógica de negocio
│   ├── Repositories/         # Acceso a datos
│   ├── Hubs/                 # SignalR Hubs
│   ├── Data/                 # DbContext y Seeds
│   └── Database/Scripts/     # Scripts SQL
├── Frontend/                  # Aplicación Angular
│   ├── src/app/
│   │   ├── core/            # Servicios core
│   │   ├── shared/          # Componentes compartidos
│   │   └── features/        # Módulos de funcionalidad
│   └── src/environments/    # Configuraciones
├── docs/                     # Documentación
│   ├── deployment/          # Guías de despliegue
│   ├── api/                 # Documentación API
│   └── database/            # Esquemas y migraciones
└── railway.json             # Configuración Railway
```

## 🔧 Configuración Rápida

### Requisitos Previos
- Node.js 20+
- .NET 8 SDK
- MySQL 8.0+
- Git

### Instalación Local

1. **Clonar repositorio**
```bash
git clone https://github.com/emiliolp1818/flexoAPP_2.git
cd flexoAPP_2
```

2. **Configurar Backend**
```bash
cd backend
dotnet restore
dotnet build
```

3. **Configurar Frontend**
```bash
cd Frontend
npm install
```

4. **Configurar Base de Datos**
- Crear base de datos MySQL
- Actualizar connection string en `appsettings.json`
- Ejecutar scripts de `backend/Database/Scripts/`

5. **Ejecutar**
```bash
# Terminal 1 - Backend
cd backend
dotnet run

# Terminal 2 - Frontend
cd Frontend
npm start
```

## 📚 Documentación

- [Guía de Despliegue Railway](./deployment/RAILWAY_DEPLOYMENT.md)
- [Documentación API](./api/API_DOCUMENTATION.md)
- [Esquema de Base de Datos](./database/DATABASE_SCHEMA.md)
- [Especificaciones del Sistema](../FLEXOAPP_SPECIFICATIONS.md)

## 🔐 Credenciales por Defecto

- **Usuario**: admin
- **Contraseña**: admin123

⚠️ **Importante**: Cambiar estas credenciales en producción

## 🛠️ Scripts Útiles

### Backend
```bash
dotnet build                    # Compilar
dotnet run                      # Ejecutar
dotnet test                     # Tests
dotnet publish -c Release       # Publicar
```

### Frontend
```bash
npm start                       # Desarrollo
npm run build:prod             # Build producción
npm run build:railway          # Build Railway
npm test                       # Tests
npm run lint                   # Linter
```

## 📊 Características Principales

### Gestión de Máquinas
- CRUD completo de máquinas
- Estados: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
- Importación masiva desde Excel
- Exportación a Excel y PDF

### Diseños y Anilox
- Catálogo de diseños
- Gestión de anilox
- Condiciones únicas
- Documentos adjuntos

### Reportes
- Reportes por máquina
- Reportes por usuario
- Reportes por rango de fechas
- Exportación a Excel/PDF

### Tiempo Real
- Sincronización automática entre clientes
- Notificaciones de cambios
- WebSocket con SignalR

### Auditoría
- Log de todas las operaciones
- Historial de cambios
- Trazabilidad completa

## 🤝 Contribución

Este es un proyecto privado. Para contribuir:
1. Crear una rama desde `main`
2. Hacer cambios y commit
3. Crear Pull Request
4. Esperar revisión

## 📝 Licencia

Propietario: FlexoAPP Team
Todos los derechos reservados.

## 📧 Contacto

- Email: support@flexoapp.com
- Equipo: FlexoAPP Team

---

**Versión**: 2.0.0  
**Última actualización**: Febrero 2026

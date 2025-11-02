# 🚀 FlexoAPP - Sistema de Gestión Flexográfica

Sistema profesional de gestión de producción para máquinas flexográficas, desarrollado con **ASP.NET Core 8.0** y **Angular 17**, diseñado para optimizar el control y monitoreo de procesos industriales.

## ✨ Características Principales

- **🏭 Gestión de Diseños**: Control completo de diseños flexográficos
- **📊 Programación de Máquinas**: Planificación y seguimiento de producción
- **⚡ Tiempo Real**: Dashboard con actualizaciones en vivo (SignalR)
- **🔐 Autenticación JWT**: Sistema seguro con roles y permisos
- **📈 Reportes Avanzados**: Análisis detallado con exportación Excel
- **🎨 Interfaz Moderna**: Diseño responsive con Angular Material
- **📱 Importación Excel**: Carga masiva de datos desde archivos Excel
- **🔍 Auditoría Completa**: Tracking de todas las operaciones

## 🛠️ Stack Tecnológico

### **Backend - ASP.NET Core 8.0**
- **Framework**: ASP.NET Core 8.0 Web API
- **Base de Datos**: MySQL 8.0+ con Entity Framework Core
- **Autenticación**: JWT Bearer Token
- **ORM**: Entity Framework Core + Pomelo MySQL
- **Documentación**: Swagger/OpenAPI
- **Tiempo Real**: SignalR Hubs
- **Excel**: EPPlus para importación/exportación

### **Frontend - Angular 17**
- **Framework**: Angular 17 con TypeScript
- **UI Components**: Angular Material
- **Estado**: RxJS y Observables
- **HTTP**: Angular HttpClient
- **Routing**: Angular Router

## 📋 Prerrequisitos

- **.NET 8.0 SDK** o superior
- **Node.js 18.0** o superior
- **Angular CLI 17.0** o superior
- **MySQL Server 8.0** o superior
- **Windows 10/11** (recomendado)

## 🚀 Instalación y Configuración

### **1. Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd flexoAPP3
```

### **2. Configurar Backend (.NET)**
```bash
cd flexoAPP-backent
dotnet restore
dotnet build
```

### **3. Configurar Base de Datos MySQL**
```sql
CREATE DATABASE flexoapp_db;
-- Las tablas se crean automáticamente con Entity Framework
```

### **4. Configurar Frontend (Angular)**
```bash
cd flexoAPP-Frontend
npm install
```

### **5. Configurar Variables de Entorno**
Editar `flexoAPP-backent/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_db;Uid=root;Pwd=TU_PASSWORD;"
  }
}
```

## 🎯 Inicio Rápido

### **Opción 1: Script Automático**
```bash
quick-start.bat
```

### **Opción 2: Manual**
```bash
# Terminal 1 - Backend (.NET)
cd flexoAPP-backent
dotnet run

# Terminal 2 - Frontend (Angular)
cd flexoAPP-Frontend
ng serve
```

## 🌐 Acceso al Sistema

- **🖥️ Frontend**: http://localhost:4200
- **🔌 Backend API**: http://localhost:7003
- **📚 Swagger**: http://localhost:7003/swagger
- **❤️ Health Check**: http://localhost:7003/health

### **👤 Credenciales por Defecto**
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrator

## 📊 Módulos del Sistema

### **🎨 Gestión de Diseños**
- Catálogo completo de diseños flexográficos
- Información detallada: cliente, dimensiones, colores
- Estados de diseño y seguimiento
- Búsqueda y filtrado avanzado

### **🏭 Programación de Máquinas**
- Planificación de producción por máquina
- Asignación de diseños a máquinas específicas
- Control de estados (Programado, En Proceso, Completado)
- Seguimiento de operarios y turnos

### **📋 Gestión de Pedidos**
- Control de pedidos de clientes
- Vinculación con diseños y programación
- Estados de pedido y fechas de entrega
- Historial completo de pedidos

### **👥 Administración de Usuarios**
- Sistema de roles (Admin, User, Operator)
- Autenticación segura con JWT
- Gestión de permisos por módulo
- Auditoría de acciones de usuario

### **📈 Reportes y Análisis**
- Reportes de producción por período
- Estadísticas de diseños más utilizados
- Análisis de rendimiento por máquina
- Exportación a Excel de todos los datos

### **📊 Dashboard en Tiempo Real**
- Estadísticas actualizadas automáticamente
- Estado actual de todas las máquinas
- Indicadores clave de rendimiento (KPIs)
- Notificaciones y alertas

## 🏗️ Arquitectura del Sistema

```
flexoAPP3/
├── flexoAPP-Frontend/              # Aplicación Angular 17
│   ├── src/app/
│   │   ├── core/                  # Servicios principales
│   │   │   ├── auth/              # Autenticación
│   │   │   └── services/          # Servicios HTTP
│   │   ├── pages/                 # Páginas/Componentes
│   │   │   ├── design/            # Gestión de diseños
│   │   │   ├── machine-program/   # Programación
│   │   │   ├── pedidos/           # Pedidos
│   │   │   └── dashboard/         # Dashboard
│   │   ├── shared/                # Componentes compartidos
│   │   └── models/                # Interfaces TypeScript
│   └── dist/                      # Build de producción
├── flexoAPP-backent/              # API ASP.NET Core 8.0
│   ├── Controllers/               # Controladores API REST
│   ├── Services/                  # Lógica de negocio
│   ├── Repositories/              # Acceso a datos
│   ├── Models/                    # Entidades y DTOs
│   │   ├── Entities/              # Entidades EF Core
│   │   ├── DTOs/                  # Data Transfer Objects
│   │   └── Enums/                 # Enumeraciones
│   ├── Data/                      # Contexto EF Core
│   ├── Hubs/                      # SignalR Hubs
│   └── Migrations/                # Migraciones EF Core
├── quick-start.bat                # Script de inicio rápido
└── BACKEND_FLEXOAPP_DOCUMENTACION_COMPLETA.md
```

## 🔧 APIs y Endpoints

### **🔐 Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Información del usuario
- `POST /api/auth/refresh` - Renovar token

### **🎨 Diseños**
- `GET /api/designs` - Obtener todos los diseños
- `POST /api/designs` - Crear nuevo diseño
- `PUT /api/designs/{id}` - Actualizar diseño
- `DELETE /api/designs/{id}` - Eliminar diseño
- `POST /api/designs/import/excel` - Importación masiva
- `GET /api/designs/export/excel` - Exportar a Excel

### **🏭 Programación de Máquinas**
- `GET /api/machine-programs` - Obtener programaciones
- `POST /api/machine-programs` - Crear programación
- `PUT /api/machine-programs/{id}` - Actualizar estado

### **📋 Pedidos**
- `GET /api/pedidos` - Obtener pedidos
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/{id}` - Actualizar pedido

### **📊 Reportes**
- `GET /api/reports/designs` - Reporte de diseños
- `GET /api/reports/production` - Reporte de producción

## 🚀 Funcionalidades Avanzadas

### **📱 Importación Excel**
- Carga masiva de diseños desde archivos Excel
- Validación automática de datos
- Plantillas predefinidas
- Manejo de errores detallado

### **⚡ Tiempo Real con SignalR**
- Actualizaciones automáticas del dashboard
- Notificaciones de cambios de estado
- Sincronización entre usuarios
- Hub: `/hubs/machine-programs`

### **🔍 Auditoría Completa**
- Registro de todas las operaciones CRUD
- Tracking por usuario y timestamp
- Historial de cambios detallado
- Consultas por entidad y período

### **🎯 Búsqueda y Filtrado**
- Búsqueda en tiempo real
- Filtros por múltiples campos
- Ordenamiento dinámico
- Paginación optimizada

## 🔒 Seguridad y Autenticación

### **🔐 JWT Authentication**
- Tokens seguros con expiración configurable
- Refresh tokens para sesiones extendidas
- Claims personalizados por rol
- Middleware de autorización

### **👤 Sistema de Roles**
- **Administrator**: Acceso completo al sistema
- **User**: Gestión de diseños y consultas
- **Operator**: Operaciones de máquina limitadas

### **🛡️ Validaciones**
- Validación de datos en frontend y backend
- Sanitización de inputs
- Protección contra inyección SQL
- CORS configurado para seguridad

## 📞 Soporte y Documentación

### **📚 Documentación Completa**
- `BACKEND_FLEXOAPP_DOCUMENTACION_COMPLETA.md` - Documentación técnica completa
- Swagger UI disponible en `/swagger`
- Comentarios en código para desarrolladores

### **🔧 Scripts de Utilidad**
- `quick-start.bat` - Inicio rápido del sistema
- `test-dotnet-backend.bat` - Pruebas del backend
- `start-backend.bat` - Solo backend
- `start-backend-large-files.bat` - Backend con archivos grandes

### **❤️ Health Checks**
- `/health` - Estado del sistema
- `/api/test` - Test de conectividad
- Monitoreo de base de datos
- Verificación de servicios

## 📄 Licencia y Versión

**FlexoAPP v2.0.0** - Sistema de Gestión Flexográfica Profesional

- **Framework**: ASP.NET Core 8.0 + Angular 17
- **Base de Datos**: MySQL 8.0 con Entity Framework Core
- **Arquitectura**: Clean Architecture con Repository Pattern
- **Licencia**: Sistema propietario - Todos los derechos reservados

---

*Sistema optimizado para producción con tecnologías modernas y escalables*#   f l e x o A P P _ 2  
 
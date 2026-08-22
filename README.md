# FlexoAPP - Sistema de Gestión Flexográfica

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Sistema completo de gestión para procesos flexográficos con sincronización en tiempo real.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/emiliolp1818/flexoAPP_2.git
cd flexoAPP_2

# 2. Backend
cd backend
dotnet restore
dotnet run

# 3. Frontend (nueva terminal)
cd Frontend
npm install
npm start
```

Accede a:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Swagger: http://localhost:8080/swagger

## 📋 Características

- ✅ Gestión completa de máquinas flexográficas
- ✅ Control de diseños y anilox
- ✅ Importación/Exportación Excel
- ✅ Generación de reportes PDF
- ✅ Sincronización en tiempo real (SignalR)
- ✅ Sistema de auditoría completo
- ✅ Autenticación JWT
- ✅ Responsive design

## 🏗️ Tecnologías

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- MySQL 8.0+
- SignalR (WebSockets)
- Serilog
- JWT Authentication

### Frontend
- Angular 18
- Angular Material
- Chart.js
- ExcelJS
- jsPDF
- RxJS

## 📁 Estructura

```
flexoAPP_2/
├── backend/              # API .NET Core
│   ├── Controllers/     # REST endpoints
│   ├── Models/          # Entidades y DTOs
│   ├── Services/        # Lógica de negocio
│   ├── Hubs/            # SignalR hubs
│   └── Database/        # Scripts SQL
├── Frontend/            # App Angular
│   └── src/app/
│       ├── core/       # Servicios core
│       ├── shared/     # Componentes compartidos
│       └── features/   # Módulos
├── docs/               # Documentación
│   ├── deployment/    # Guías de despliegue
│   └── api/           # Docs API
└── README.md          # Este archivo
```

## 📚 Documentación

- [📖 Documentación Completa](./docs/README.md)
- [🚀 Guía de Despliegue Railway](./docs/deployment/RAILWAY_DEPLOYMENT.md)
- [⚡ Inicio Rápido Railway](./docs/deployment/RAILWAY_QUICK_START.md)
- [📋 Especificaciones del Sistema](./docs/SPECIFICATIONS.md)

## 🔧 Configuración

### Variables de Entorno

#### Backend (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp;User=root;Password=your_password;"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key",
    "Issuer": "FlexoAPP",
    "Audience": "FlexoAPP-Users"
  }
}
```

#### Frontend (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🧪 Testing

```bash
# Backend
cd backend
dotnet test

# Frontend
cd Frontend
npm test
```

## 📦 Build para Producción

```bash
# Backend
cd backend
dotnet publish -c Release -o out

# Frontend
cd Frontend
npm run build:prod
```

## 🚢 Despliegue

### Railway (Recomendado)

1. Crear proyecto en [Railway](https://railway.app)
2. Conectar repositorio GitHub
3. Configurar Root Directory: `backend`
4. Agregar servicio MySQL
5. Configurar variables de entorno

Ver [guía completa de despliegue](./docs/deployment/RAILWAY_DEPLOYMENT.md)

## 🛠️ Scripts Disponibles

### Backend
```bash
dotnet build              # Compilar
dotnet run                # Ejecutar
dotnet test               # Tests
dotnet publish            # Publicar
```

### Frontend
```bash
npm start                 # Desarrollo
npm run build:prod        # Build producción
npm run build:railway     # Build Railway
npm test                  # Tests
npm run lint              # Linter
npm run analyze           # Analizar bundle
```

## 🔐 Seguridad

- Autenticación JWT con refresh tokens
- Encriptación de contraseñas con BCrypt
- CORS configurado
- Validación de datos en backend y frontend
- SQL injection protection con EF Core
- XSS protection

## 📊 Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `maquinas` - Máquinas flexográficas
- `designs` - Diseños
- `anilox` - Catálogo de anilox
- `activities` - Log de actividades
- `documentos` - Archivos adjuntos

Ver [esquema completo](./docs/database/DATABASE_SCHEMA.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Changelog

### v2.0.0 (Febrero 2026)
- ✨ Migración a .NET 8
- ✨ Actualización a Angular 18
- ✨ Implementación de SignalR
- ✨ Migración de XLSX a ExcelJS
- 🐛 Corrección de parseo de kilos/metros
- 🚀 Configuración para Railway
- 📝 Documentación completa

## 📄 Licencia

Propietario: FlexoAPP Team  
Todos los derechos reservados.

## 👥 Equipo

**FlexoAPP Team**
- Email: support@flexoapp.com

## 🙏 Agradecimientos

- Angular Team
- .NET Team
- Railway
- Comunidad Open Source

---

**Hecho con ❤️ por FlexoAPP Team**

